import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/agent/workspace', req.url))
    }
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(role === 'ADMIN' ? '/admin/dashboard' : '/agent/workspace', req.url)
      )
    }
    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = { matcher: ['/', '/admin/:path*', '/agent/:path*'] }
