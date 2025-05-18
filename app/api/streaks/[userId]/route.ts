import { NextResponse } from "next/server";
import { getUserStreak, getSubmissions } from "@/lib/airtable";
import { startOfWeek } from "date-fns";
import { validateRequest } from "@/lib/middleware";
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
    
    // Generate heatmap data
    const heatmap = submissions.reduce((acc, submission) => {
      acc[submission.date] = {
        count: submission.streakCount,
        date: submission.date
      };
      return acc;
    }, {} as Record<string, { count: number; date: string }>);
    
    // Get the start of the current week (Monday)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
    
    return NextResponse.json({
      userId,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      heatmap,
      weekStart
    });
    
  } catch (error) {
    console.error("Error in /api/streaks/[userId]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve streak data" },
      { status: 500 }
    );
  }
}