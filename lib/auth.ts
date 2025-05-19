import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function validateRequest(request: NextRequest) {
  // Check for admin key first
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey) {
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 401 }
      );
    }
    return null; // Admin key is valid
  }

  // If no admin key, check for authenticated session
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }

  return null; // Session is valid
} 