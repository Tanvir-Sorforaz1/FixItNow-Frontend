import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/bookings", "/checkout", "/profile", "/payments", "/technician", "/admin"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("fixitnow-token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/bookings/:path*", "/checkout/:path*", "/profile/:path*", "/payments/:path*", "/technician/:path*", "/admin/:path*", "/login", "/register"],
};
