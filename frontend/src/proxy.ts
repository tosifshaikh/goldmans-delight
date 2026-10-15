import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(req:NextRequest) {
    const {pathname} = req.nextUrl;
    const token = req.cookies.get('gd_token')?.value

    const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p+'/')
    )
    const isAuthPage = pathname.startsWith("/login")
    const isProtected = pathname.startsWith("/dashboard")

    if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
    /* if (isPublic && token)
        return NextResponse.redirect(new URL('/dashboard',req.url))

    if (!isPublic && !token) {
        const loginURL = new URL('/login',req.url)
        loginURL.searchParams.set('from',pathname)
        return NextResponse.redirect(loginURL)
    } */

    return NextResponse.next()
}

export const config = {
  matcher: [
    // everything except Next internals + static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};