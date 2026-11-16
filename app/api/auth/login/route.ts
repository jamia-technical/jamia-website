import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-if-env-not-set');

// Define user accounts with their roles
function getUserAccount(username: string) {
  const accounts = [
    {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    },
    {
      username: process.env.PANEL_ADMIN_USERNAME,
      password: process.env.PANEL_ADMIN_PASSWORD,
      role: 'panel_admin',
    },
  ];

  return accounts.find((a) => a.username && a.username === username) || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password required" },
        { status: 400 }
      );
    }

    const account = getUserAccount(username);

    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    let isMatch = false;
    const isHashed = account.password.startsWith('$2a$') || account.password.startsWith('$2b$');

    if (isHashed) {
      isMatch = await bcrypt.compare(password, account.password);
    } else {
      isMatch = password === account.password;
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create JWT with role
    const token = await new SignJWT({ username: account.username, role: account.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(JWT_SECRET);

    // Set cookie
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        message: "Welcome!",
        user: { username: account.username, role: account.role },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
