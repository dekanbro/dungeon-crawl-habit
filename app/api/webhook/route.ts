import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { validateRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Validate request (admin key required for webhooks)
    const validation = await validateRequest(request as any);
    if (validation) {
      return validation;
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookBearerKey = process.env.WEBHOOK_BEARER_KEY;

    if (!webhookUrl || !webhookBearerKey) {
      console.error('Webhook configuration missing:', { webhookUrl: !!webhookUrl, webhookBearerKey: !!webhookBearerKey });
      return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, date, submissionText, streakCount } = body;

    if (!userId || !date || !submissionText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user data from Airtable to check for Discord ID
    const userUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users?filterByFormula=${encodeURIComponent(`{email} = '${userId}'`)}&maxRecords=1`;
    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    let discordId;
    let discordUsername;
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.records?.[0]?.fields) {
        discordId = userData.records[0].fields.discordId;
        discordUsername = userData.records[0].fields.discordUsername;
      }
    }

    // If no Discord username found, use email
    const displayName = discordUsername || userId;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookBearerKey}`
      },
      body: JSON.stringify({
        message: `User ${displayName} submitted an update: "${submissionText.slice(0, 250)}" (Streak: ${streakCount})`,
        discordId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json({ 
        error: 'Failed to trigger webhook',
        details: errorText
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/webhook:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}