import { NextResponse } from "next/server";
import { getUserStreak, getSubmissions } from "@/lib/airtable";
import { startOfWeek } from "date-fns";
import { validateRequest } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Validate request (either admin key or authenticated session)
    const validation = await validateRequest(request as any);
    if (validation) {
      return validation;
    }

    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    const isAdminRequest = request.headers.get('x-admin-key') !== null;

    // If not an admin request, verify user is requesting their own data
    if (!isAdminRequest && userId !== session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - You can only view your own streak data" },
        { status: 403 }
      );
    }
    
    // Get user's streak data
    const streakData = await getUserStreak(userId);
    
    // Get user's submissions for heatmap
    const submissions = await getSubmissions(userId);
    
    // Get the week start from query params or use current week
    const url = new URL(request.url);
    const weekStartParam = url.searchParams.get('weekStart');
    const weekStart = weekStartParam 
      ? new Date(weekStartParam)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    
    // Generate heatmap data
    const heatmap = submissions.reduce((acc, submission) => {
      const submissionDate = new Date(submission.date);
      const weekDiff = Math.floor((submissionDate.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Only include submissions within the 4-week window
      if (weekDiff >= 0 && weekDiff < 4) {
        acc[submission.date] = {
          count: submission.streakCount,
          date: submission.date
        };
      }
      return acc;
    }, {} as Record<string, { count: number; date: string }>);
    
    return NextResponse.json({
      userId,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      heatmap,
      weekStart: weekStart.toISOString()
    });
    
  } catch (error) {
    console.error("Error in /api/streaks/[userId]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve streak data" },
      { status: 500 }
    );
  }
}