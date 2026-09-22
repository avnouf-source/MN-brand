import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, body, category } = await req.json()
  const template = await prisma.template.create({ data: { name, body, category: category ?? 'MARKETING' } })
  return NextResponse.json(template)
}
