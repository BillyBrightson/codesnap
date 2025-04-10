import { NextRequest, NextResponse } from 'next/server';

// TEMPORARY FIX: Skip authentication for testing the login/dashboard flow
// Remove this function once Firebase Admin is properly configured
export async function middleware(request: NextRequest) {
  console.log("Middleware called for path:", request.nextUrl.pathname);
  
  // During testing and development, allow direct access to dashboard
  if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: bypassing auth check");
    return NextResponse.next();
  }
  
  // Default middleware behavior below - currently bypassed in development
  const session = request.cookies.get('auth-token')?.value;
  console.log("Auth cookie present:", !!session);

  // Check if the user is accessing protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
    request.nextUrl.pathname.startsWith('/account');
    
  // Check if the user is accessing auth routes (login/register)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register');

  // Redirect logic 
  if (!session && isProtectedRoute) {
    console.log("No auth cookie found, redirecting to login");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isAuthRoute) {
    console.log("Auth cookie found, redirecting to dashboard");
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/login',
    '/register',
  ],
}; 