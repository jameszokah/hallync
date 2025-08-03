import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

const protectedRoutes = ["/dashboard", "/owner", "/admin"];
const ownerRoutes = ["/owner"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  console.log(session?.user, "session user");

  // If user is not authenticated and is trying to access a protected route
  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session) {
    // New social user onboarding check - redirect to onboarding if role is null/undefined
    if (
      session.user.role === null &&
      pathname !== "/auth/onboarding"
    ) {
      return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }

    // Role-based redirection
    if (ownerRoutes.some((route) => pathname.startsWith(route))) {
      if (session.user.role !== "OWNER") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (session.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Redirect logged in users from auth pages
    if (
      pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register")
    ) {
      // If user has no role, redirect to onboarding
      if (!session.user.role) {
        return NextResponse.redirect(new URL("/auth/onboarding", request.url));
      }

      // Otherwise redirect based on role
      switch (session.user.role) {
        case "OWNER":
          return NextResponse.redirect(
            new URL("/owner/dashboard", request.url),
          );
        case "ADMIN":
          return NextResponse.redirect(new URL("/admin", request.url));
        default:
          return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/owner/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
    "/auth/onboarding",
    "/",
  ],
};
