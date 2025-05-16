import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.date || !body.submissionText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get or create user in Airtable
    const user = await createOrUpdateUser({
      email: body.userId,
      createdAt: new Date().toISOString()
    });
    
    const notificationMessage = formatNotification({
      ...body,
      userName: user.name || "Adventurer"
    });
    
    const success = await sendNotification(notificationMessage);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error in /api/webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Helper function to format notification
function formatNotification(data: any): string {
  // Format streak achievement message
  let streakMessage = "";
  if (data.streakCount >= 7) {
    streakMessage = "🔥 They're on fire with a 7+ day streak!";
  } else if (data.streakCount >= 3) {
    streakMessage = "✨ Their streak continues!";
  } else if (data.streakCount === 1) {
    streakMessage = "🚀 They've started a new streak!";
  }
  
  // Create notification message
  return `**${data.userName}** has updated their dungeon progress on ${data.date}!\n${streakMessage}`;
}

// Helper function to send notification
async function sendNotification(message: string): Promise<boolean> {
  try {
    // In production, this would send to an actual webhook
    // Example for Discord:
    // const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    // const response = await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: message })
    // });
    // return response.ok;
    
    // For the demo, log what would be sent
    console.log("Would send notification:", message);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}