import type { UserStreak, UserUpdate, SubmissionPayload } from "./types";
import { parseISO } from "date-fns";

/**
 * Fetch user streak data 
 */
export async function fetchUserStreaks(userId: string): Promise<UserStreak> {
  try {
    const response = await fetch(`/api/streaks/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user streaks');
    }
    const data = await response.json();
    
    // Convert the heatmap data to the expected format
    const heatmap = Array(4).fill(null).map(() => Array(7).fill(null));
    
    // Fill in the heatmap with streak values
    Object.entries(data.heatmap).forEach(([date, value]) => {
      const dateObj = parseISO(date);
      const weekStart = parseISO(data.weekStart);
      const weekIndex = Math.floor((dateObj.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const dayIndex = dateObj.getDay() || 7; // Convert Sunday (0) to 7
      
      if (weekIndex >= 0 && weekIndex < 4 && dayIndex >= 1 && dayIndex <= 7) {
        heatmap[weekIndex][dayIndex - 1] = (value as { count: number }).count;
      }
    });
    
    return {
      userId: data.userId,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      heatmap
    };
  } catch (error) {
    console.error('Error fetching user streaks:', error);
    throw error;
  }
}

/**
 * Fetch user update history
 */
export async function fetchUserUpdates(userId: string): Promise<UserUpdate[]> {
  try {
    const response = await fetch(`/api/updates/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user updates');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching user updates:', error);
    throw error;
  }
}

/**
 * Submit a new update
 */
export async function submitUpdate(
  userId: string, 
  date: string, 
  submissionText: string
): Promise<void> {
  try {
    const payload: SubmissionPayload = {
      userId,
      date,
      submissionText
    };
    
    // Make POST request to /api/submit
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit update');
    }
    
    const data = await response.json();
    
    // Trigger webhook notification
    await triggerWebhook(userId, date, submissionText, data.streakCount);
  } catch (error) {
    console.error('Error submitting update:', error);
    throw error;
  }
}

/**
 * Trigger webhook notification
 */
export async function triggerWebhook(
  userId: string,
  date: string,
  submissionText: string,
  streakCount: number
): Promise<void> {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookBearerKey = process.env.WEBHOOK_BEARER_KEY;

    if (!webhookUrl || !webhookBearerKey) {
      console.warn('Webhook URL or Bearer Key not configured');
      return;
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

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (webhookBearerKey) {
      headers['Authorization'] = `Bearer ${webhookBearerKey}`;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: `User @${discordUsername} submitted an update: "${submissionText.slice(0, 250)}" (Streak: ${streakCount})`,
        discordId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger webhook');
    }
  } catch (error) {
    console.error('Error triggering webhook:', error);
    throw error;
  }
}