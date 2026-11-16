import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-if-env-not-set');

async function getTokenPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username?: string; role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin dashboard routes
  if (pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await getTokenPayload(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // panel_admin can ONLY access enquiries pages
    if (payload.role === 'panel_admin') {
      const isEnquiriesPage = pathname.startsWith('/admin/dashboard/enquiries');
      if (!isEnquiriesPage) {
        // Redirect panel_admin to enquiries if they try to access other pages
        return NextResponse.redirect(new URL('/admin/dashboard/enquiries', request.url));
      }
    }

    // Inject role into response headers so client components can read it
    const response = NextResponse.next();
    response.headers.set('x-user-role', payload.role || 'admin');
    return response;
  }

  const token = request.cookies.get('admin_token')?.value;

  if (pathname === '/admin') {
    if (token) {
      const payload = await getTokenPayload(token);
      if (payload?.role === 'panel_admin') {
        return NextResponse.redirect(new URL('/admin/dashboard/enquiries', request.url));
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname === '/admin/login' && token) {
    const payload = await getTokenPayload(token);
    if (payload) {
      if (payload.role === 'panel_admin') {
        return NextResponse.redirect(new URL('/admin/dashboard/enquiries', request.url));
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // Invalid token, allow login page
  }

  // Also protect sensitive API routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/login')) {
    // List of API routes that require protection
    const protectedApis = ['/api/news', '/api/publications', '/api/deleteImage', '/api/getadmn'];
    
    if (protectedApis.some(api => pathname.startsWith(api))) {
        // ALLOW GET requests for public endpoints (like news)
        if (request.method === 'GET' && (pathname.startsWith('/api/news') || pathname.startsWith('/api/publications'))) {
            return NextResponse.next();
        }

        // Special case for Admissions:
        // We allow students to:
        // 1. POST to /api/getadmn (Submit Step 1) - THIS IS FOR PUBLIC
        // 2. GET/PUT /api/getadmn/[id] (Fetch/Update Step 2) - THIS IS FOR THE INDIVIDUAL STUDENT
        // BUT we protect GET /api/getadmn (The full list for admins)
        if (pathname.startsWith('/api/getadmn')) {
            const isBaseRoute = pathname === '/api/getadmn';
            const isGet = request.method === 'GET';
            const isPost = request.method === 'POST';

            // Allow public POST (registration)
            if (isPost && isBaseRoute) {
                return NextResponse.next();
            }
            
            // Allow individual record access (Step 2)
            if (!isBaseRoute) {
                return NextResponse.next();
            }

            // Protect the main list GET /api/getadmn
            if (isGet && isBaseRoute) {
                // fall through to token check
            } else {
                // Other mutations or paths? Usually just PUT/DELETE on subroutes which we allowed above? 
                // Wait, if it's NOT base route, we allowed it. That's fine for Step 2.
            }
        }

        if (!token) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        try {
          await jwtVerify(token, JWT_SECRET);
          return NextResponse.next();
        } catch (error) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin', '/admin/login', '/admin/dashboard/:path*', '/api/:path*'],
};
