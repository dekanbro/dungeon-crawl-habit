import { NextResponse } from "next/server";
import type { SubmissionPayload } from "@/lib/types";
import { createSubmission, updateSubmission, getSubmissions, getUserStreak, updateUserStreak, createStreak } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const body = await request.json() as SubmissionPayload;
    const { userId, date, submissionText } = body;
    
    // Validate required fields
    if (!userId || !date || !submissionText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get existing submissions for the user
    const existingSubmissions = await getSubmissions(userId);
    const existingEntry = existingSubmissions.find(entry => entry.date === date);
    
    // Get user's current streak
    let userStreak = await getUserStreak(userId);

    // If userStreak.id is missing, create a new streak record
    if (!userStreak.id) {
      userStreak = await createStreak(userId);
    }
    
    let newStreakCount = userStreak.currentStreak;
    let shouldUpdateStreak = false;

    if (!existingEntry) {
      // Calculate new streak count for a new entry
      const today = new Date(date);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Sort submissions by date in descending order
      const sortedSubmissions = existingSubmissions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      newStreakCount = 1; // Start with 1 for today's submission
      
      // Check if there's a submission from yesterday
      const hasYesterdaySubmission = sortedSubmissions.some(
        entry => entry.date === yesterdayStr
      );
      
      if (hasYesterdaySubmission) {
        // If there's a submission from yesterday, continue the streak
        newStreakCount = userStreak.currentStreak + 1;
      } else {
        // If there's no submission from yesterday, check if there are any gaps
        let currentDate = yesterday;
        let streakBroken = false;
        for (let i = 0; i < 7; i++) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const hasSubmission = sortedSubmissions.some(entry => entry.date === dateStr);
          if (!hasSubmission && i > 0) {
            streakBroken = true;
            break;
          }
          currentDate.setDate(currentDate.getDate() - 1);
        }
        if (!streakBroken) {
          newStreakCount = userStreak.currentStreak + 1;
        }
      }
      shouldUpdateStreak = true;
    }
    
    // Update streak if it's a new record and shouldUpdateStreak is true
    if (shouldUpdateStreak) {
      if (newStreakCount > userStreak.longestStreak) {
        await updateUserStreak(userStreak.id!, {
          currentStreak: newStreakCount,
          longestStreak: newStreakCount,
          lastUpdated: new Date().toISOString()
        });
      } else {
        await updateUserStreak(userStreak.id!, {
          currentStreak: newStreakCount,
          lastUpdated: new Date().toISOString()
        });
      }
    }
    
    if (existingEntry) {
      // Update existing entry, do not change streakCount
      const updatedSubmission = await updateSubmission(existingEntry.id!, {
        submissionText,
        updatedAt: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true,
        streakCount: userStreak.currentStreak,
        submission: updatedSubmission
      });
    } else {
      // Create new entry
      const newSubmission = await createSubmission({
        userId,
        date,
        submissionText,
        streakCount: newStreakCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true,
        streakCount: newStreakCount,
        submission: newSubmission
      });
    }
    
  } catch (error) {
    console.error("Error in /api/submit:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}