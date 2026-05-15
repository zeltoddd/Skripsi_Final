// middleware.ts
import NextAuth from "next-auth"
import authConfig from "./lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // 1. Jalur Hijau: Bebas akses buat internal Next.js & API tertentu
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/api/chat/tts') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth

   // Public routes
   const publicRoutes = ['/login', '/register', '/chat']
   const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r))

  // Redirect logic
  if (!isLoggedIn && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Exclude internal paths and public files
  matcher: ['/((?!api/auth|api/chat/tts|_next/static|_next/image|_next/webpack-hmr|favicon.ico|public|images).*)'],
}
