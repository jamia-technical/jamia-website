import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-if-env-not-set');

export async function GET() {
  try {
    const token = cookies().get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      success: true,
      user: {
        username: payload.username,
        role: payload.role || 'admin',
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}
