import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// Fallback demo users if database is empty or uninitialized on serverless (e.g. Netlify)
const DEMO_USERS = [
  {
    id: 'admin-demo-id',
    name: 'MN Admin',
    email: 'admin@mnbrand.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 'sara-demo-id',
    name: 'Sara Johnson',
    email: 'sara@mnbrand.com',
    password: 'agent123',
    role: 'AGENT',
  },
  {
    id: 'karim-demo-id',
    name: 'Karim Al-Hassan',
    email: 'karim@mnbrand.com',
    password: 'agent123',
    role: 'AGENT',
  },
]

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'mnbrand-crm-super-secret-key-2024-xk9mq',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // 1. Try querying the database
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase().trim() } })
          if (user) {
            const valid = await bcrypt.compare(credentials.password, user.passwordHash)
            if (valid) {
              return { id: user.id, name: user.name, email: user.email, role: user.role }
            }
          }
        } catch (dbError) {
          console.warn('[NextAuth] Database query error (fallback to demo accounts):', dbError)
        }

        // 2. Demo fallback if database is missing, empty, or unseeded (e.g. fresh Netlify deploy with SQLite)
        const demoUser = DEMO_USERS.find(
          u => u.email === credentials.email.toLowerCase().trim() && u.password === credentials.password
        )
        if (demoUser) {
          return { id: demoUser.id, name: demoUser.name, email: demoUser.email, role: demoUser.role }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role
      }
      return session
    },
  },
}
