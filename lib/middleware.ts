import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function validateAdminKey(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json(
      { error: 'Invalid or missing admin key' },
      { status: 401 }
    );
  }
  
  return null; // Return null to indicate validation passed
} 