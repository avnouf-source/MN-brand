import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    const isAdminOrSubAdmin = role === 'ADMIN' || role === 'SUB_ADMIN'

    if (pathname.startsWith('/admin') && !isAdminOrSubAdmin) {
      return NextResponse.redirect(new URL('/agent/workspace', req.url))
    }
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(isAdminOrSubAdmin ? '/admin/dashboard' : '/agent/workspace', req.url)
      )
    }
    return NextResponse.next()
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/login' },
  }
)

export const config = { matcher: ['/', '/admin/:path*', '/agent/:path*'] }
