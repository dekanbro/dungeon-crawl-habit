import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/airtable";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 30;
    
    // Get user's submissions
    const submissions = await getSubmissions(userId, limit);
    
    return NextResponse.json(submissions);
    
  } catch (error) {
    console.error("Error in /api/updates/[userId]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve updates" },
      { status: 500 }
    );
  }
}