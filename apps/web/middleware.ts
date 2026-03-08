import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
    console.log("middleware running")

  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  // If logged in and trying to access login/signup
  if (token && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If not logged in and trying to access protected pages
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/canvas/:path*"
  ],
}