import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/airtable";
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
        { error: "Unauthorized - You can only view your own updates" },
        { status: 403 }
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