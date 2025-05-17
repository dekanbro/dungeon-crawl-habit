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
 * Submit a new update as an admin
 */
export async function submitUpdateAsAdmin(
  userId: string, 
  date: string, 
  submissionText: string,
  adminKey: string
): Promise<void> {
  try {
    const payload: SubmissionPayload = {
      userId,
      date,
      submissionText
    };
    
    // Make POST request to /api/submit with admin key
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
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
    const response = await fetch('/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        date,
        submissionText,
        streakCount
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