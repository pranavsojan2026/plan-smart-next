import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access protected routes, redirect to login
  if (!session && (
    req.nextUrl.pathname.startsWith('/user-dashboard') ||
    req.nextUrl.pathname.startsWith('/providers/dashboard')
  )) {
    return NextResponse.redirect(new URL('/auth/user-signin', req.url));
  }

  // If session exists and trying to access auth pages, redirect to dashboard
  if (session && (
    req.nextUrl.pathname.startsWith('/auth')
  )) {
    return NextResponse.redirect(new URL('/user-dashboard', req.url));
  }

  return res;
}

// Add config for matching paths
export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/providers/dashboard/:path*',
    '/auth/:path*'
  ],
};