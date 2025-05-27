import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "./lib/supabase/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth?.getSession()


  // Check if the user is authenticated
  const isAuthenticated = !!session
  const path = req.nextUrl.pathname

  // Protected routes that require authentication
  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/owner") ||
    path.startsWith("/bookings") ||
    path.startsWith("/admin")
  ) {
    if (!isAuthenticated) {
      const redirectUrl = new URL("/auth/login", req.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing owner routes, check if user is an owner
    if (path.startsWith("/owner")) {
      const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      if (!user || user.role !== "owner") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // If accessing admin routes, check if user is an admin
    if (path.startsWith("/admin")) {
      const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      if (!user || user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (path.startsWith("/auth/login") || path.startsWith("/auth/register"))) {
    // Check user role to determine where to redirect
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (user) {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else if (user.role === "owner") {
        return NextResponse.redirect(new URL("/owner/dashboard", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*", "/bookings/:path*", "/admin/:path*", "/auth/login", "/auth/register"],
}
