import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import authConfig from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

// You can set this to true to completely bypass middleware temporarily
const BYPASS_MIDDLEWARE = false;

export default auth(async function middleware(req: NextRequest) {
  // Check if middleware is being bypassed
  if (BYPASS_MIDDLEWARE) {
    console.log("⚠️ Middleware bypassed");
    return NextResponse.next();
  }

  // Check for the bypass URL parameter
  const url = new URL(req.url);
  const bypassParam = url.searchParams.get("bypass_middleware");
  if (bypassParam === "true") {
    console.log("⚠️ Middleware bypassed via URL parameter");
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await auth();
  const isAuthenticated = !!session;
  const path = req.nextUrl.pathname;

  console.log("Middleware running on path:", path);
  console.log("Session:", JSON.stringify(session?.user, null, 2));

  // For login and register pages, redirect to appropriate dashboard if already logged in
  if (path === "/auth/login" || path === "/auth/register") {
    if (isAuthenticated) {
      if (session?.user?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      if (session?.user?.role === "OWNER") {
        return NextResponse.redirect(new URL("/owner/dashboard", req.url));
      }

      // Default to student dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow access to login/register pages for unauthenticated users
    return res;
  }

  // For protected routes, check if authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // User is authenticated at this point
  const userRole = session?.user?.role || "STUDENT";

  // IMPORTANT: Check if the user is already on their proper dashboard page
  // If so, just allow the access without further redirection
  if (path === "/dashboard" && userRole === "STUDENT") {
    return res;
  }

  if (path === "/admin" && userRole === "ADMIN") {
    return res;
  }

  if (path === "/owner/dashboard" && userRole === "OWNER") {
    return res;
  }

  // For authenticated users, check role-based access
  // Admin routes check
  if (path.startsWith("/admin") && userRole !== "ADMIN") {
    // Non-admins cannot access admin routes
    if (userRole === "OWNER") {
      return NextResponse.redirect(new URL("/owner/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Owner routes check
  if (
    path.startsWith("/owner") && userRole !== "OWNER" && userRole !== "ADMIN"
  ) {
    // Non-owners cannot access owner routes (except admins who can access everything)
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Student trying to access dashboard - this is fine
  if (path === "/dashboard" && userRole === "STUDENT") {
    return res;
  }

  // At this point, the user is authenticated and has proper role access for the requested path
  return res;
});

// Modify the matcher to be more specific
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/owner",
    "/owner/:path*",
    "/bookings/:path*",
    "/admin",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};

// export const runtime = "experimental-edge"
