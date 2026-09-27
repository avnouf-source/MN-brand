import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const role = token?.role

    const isSuperAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const isAdminOrSubAdmin = isSuperAdmin || role === 'SUB_ADMIN'

    // 1. Strict Protection for Admin API Routes
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/audit-logs')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required.' },
          { status: 401 }
        )
      }
      if (!isAdminOrSubAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Super Admin privileges required.' },
          { status: 403 }
        )
      }
      return NextResponse.next()
    }

    // 2. Strict Protection for /admin UI pages (Exclusively Admin / Super Admin)
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (!isAdminOrSubAdmin) {
        return NextResponse.redirect(new URL('/agent/workspace', req.url))
      }
    }

    // 3. Root Path Redirection based on authenticated Role
    if (pathname === '/') {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      return NextResponse.redirect(
        new URL(isAdminOrSubAdmin ? '/admin/dashboard' : '/agent/workspace', req.url)
      )
    }

    // 4. Agent Workspace and Training Hub protection
    if (pathname.startsWith('/agent') || pathname.startsWith('/training-hub')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Allow public access to login and public assets
        if (pathname === '/login' || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
          return true
        }
        return !!token
      },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/agent/:path*',
    '/training-hub/:path*',
    '/api/admin/:path*',
    '/api/audit-logs/:path*',
  ],
}

