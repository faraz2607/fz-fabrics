import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "./lib/session";

// Configure middleware to run on Node.js runtime instead of Edge Runtime
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};

export const runtime = "nodejs";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if user is authenticated
  let isAuthenticated = false;
  if (sessionId) {
    const session = await validateSession(sessionId);
    isAuthenticated = session.valid;
  }

  // Redirect to login if trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Keep auth pages reachable so users can switch accounts without logging out first.
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
