import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/airtable";
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
        { error: "Unauthorized - You can only view your own update data" },
        { status: 403 }
      );
    }
    
    // Get user's submissions
    const submissions = await getSubmissions(userId);
    
    // Get the week start from query params or use current week
    const url = new URL(request.url);
    const weekStartParam = url.searchParams.get('weekStart');
    const weekStart = weekStartParam 
      ? new Date(weekStartParam)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    
    // Filter submissions to only include those within the 4-week window
    const filteredSubmissions = submissions.filter(submission => {
      const submissionDate = new Date(submission.date);
      const weekDiff = Math.floor((submissionDate.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekDiff >= 0 && weekDiff < 4;
    });
    
    return NextResponse.json(filteredSubmissions);
    
  } catch (error) {
    console.error("Error in /api/updates/[userId]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve update data" },
      { status: 500 }
    );
  }
}