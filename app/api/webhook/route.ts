import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { validateRequest } from "@/lib/middleware";

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
      return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, date, submissionText, streakCount } = body;

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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookBearerKey}`
      },
      body: JSON.stringify({
        message: `User @${discordUsername} submitted an update: "${submissionText.slice(0, 250)}" (Streak: ${streakCount})`,
        discordId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger webhook');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}