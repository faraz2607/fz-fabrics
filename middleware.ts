import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "./lib/session";

// Configure middleware to run on Node.js runtime instead of Edge Runtime
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/employee/:path*",
    "/thread/:path*",
    "/bill/:path*",
    "/fabrics/:path*",
    "/members/:path*",
    "/organization-pending",
    "/api/:path*",
    "/auth/:path*",
  ],
};

export const runtime = "nodejs";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/users",
  "/employee",
  "/thread",
  "/bill",
  "/fabrics",
  "/members",
  "/organization-pending",
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthApiRoute = pathname.startsWith("/api/auth/");

  // Check if user is authenticated
  let session: Awaited<ReturnType<typeof validateSession>> = { valid: false };
  if (sessionId) {
    session = await validateSession(sessionId);
  }
  const isAuthenticated = session.valid;

  if (isApiRoute && !isAuthApiRoute && isAuthenticated && session.organizationActive === false) {
    return NextResponse.json(
      { error: "Your organization is not active yet. Please contact your organization administrator." },
      { status: 403 },
    );
  }

  // Redirect to login if trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (
    isProtectedRoute &&
    isAuthenticated &&
    session.organizationActive === false &&
    pathname !== "/organization-pending"
  ) {
    return NextResponse.redirect(new URL("/organization-pending", request.url));
  }

  // Authenticated users should leave login/signup and return to their app.
  if (isAuthRoute && isAuthenticated) {
    const destination = session.organizationActive === false ? "/organization-pending" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}
