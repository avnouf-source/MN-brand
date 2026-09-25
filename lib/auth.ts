import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// B Perfume Luxury CRM Users (Super Admin Nouf, 2 Sub-Admins, 8 Sales Agents)
const B_PERFUME_USERS = [
  // 1. Super Admin (Absolute System Control)
  {
    id: 'super-admin-nouf',
    name: 'Nouf',
    email: 'admin@bperfume.com',
    password: 'Nouf1234',
    role: 'ADMIN',
  },

  // 2. Sub-Admins (Managerial Access - 2 Users)
  {
    id: 'subadmin-alnas',
    name: 'Alnas',
    email: 'alnas@bperfume.com',
    password: 'Alnas1234',
    role: 'SUB_ADMIN',
  },
  {
    id: 'subadmin-rashid',
    name: 'Rashid',
    email: 'rashid@bperfume.com',
    password: 'Rashid1234',
    role: 'SUB_ADMIN',
  },

  // 3. Exactly 8 Sales Agents
  { id: 'agent-1', name: 'Adarsh', email: 'adarsh@bperfume.com', password: 'Adarsh0000', role: 'AGENT' },
  { id: 'agent-2', name: 'Fathimath Shifa', email: 'fathimathshifa@bperfume.com', password: 'FathimathShifa0000', role: 'AGENT' },
  { id: 'agent-2-alias', name: 'Fathimath Shifa', email: 'fathimath@bperfume.com', password: 'FathimathShifa0000', role: 'AGENT' },
  { id: 'agent-3', name: 'Nandana', email: 'nandana@bperfume.com', password: 'Nandana0000', role: 'AGENT' },
  { id: 'agent-4', name: 'Nouf', email: 'nouf@bperfume.com', password: 'Nouf0000', role: 'AGENT' },
  { id: 'agent-5', name: 'Rizvan', email: 'rizvan@bperfume.com', password: 'Rizvan0000', role: 'AGENT' },
  { id: 'agent-6', name: 'Sajila', email: 'sajila@bperfume.com', password: 'Sajila0000', role: 'AGENT' },
  { id: 'agent-7', name: 'Sajna', email: 'sajna@bperfume.com', password: 'Sajna0000', role: 'AGENT' },
  { id: 'agent-8', name: 'Salih', email: 'salih@bperfume.com', password: 'Salih0000', role: 'AGENT' },
]

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'bperfume-luxury-crm-secret-2025-xk9mq',
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

        const cleanEmail = credentials.email.toLowerCase().trim()

        // 1. Try querying the database
        try {
          const user = await prisma.user.findUnique({ where: { email: cleanEmail } })
          if (user) {
            const valid = await bcrypt.compare(credentials.password, user.passwordHash)
            if (valid) {
              return { id: user.id, name: user.name, email: user.email, role: user.role }
            }
          }
        } catch (dbError) {
          console.warn('[NextAuth] Database query error (fallback to B Perfume accounts):', dbError)
        }

        // 2. B Perfume fallback accounts
        const demoUser = B_PERFUME_USERS.find(
          u => u.email.toLowerCase() === cleanEmail && u.password === credentials.password
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
