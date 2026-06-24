import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth'],
};

export async function proxy(request) {
  const tokenCookie = request.cookies.get('token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  if (!tokenCookie) {
    // If there's no cookie and they are trying to reach a protected route
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    // If they are on the auth page with no cookie, let them proceed
    return NextResponse.next();
  }

  // If there is a cookie, validate it
  const res = await fetch('http://localhost:8080/api/me', {
    headers: {
      Cookie: `token=${tokenCookie.value}`,
    },
  });

  const isValid = res.ok;

  // Handle /auth page access while logged in
  if (isAuthPage) {
    if (isValid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes with invalid token
  if (!isValid) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const user = await res.json();

  // Handle RBAC for /admin
  if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    // Redirect non-admins away from /admin
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
