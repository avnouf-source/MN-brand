import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  const leads = await prisma.lead.findMany({
    where: isAdmin ? {} : { assignedAgentId: userId },
    include: { assignedAgent: { select: { id: true, name: true } }, conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, phone, email, company, businessRequirement, leadSource, stage, tag, assignedAgentId } = body
  if (!name || !phone) return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  try {
    const lead = await prisma.lead.create({
      data: { name, phone, email, company, businessRequirement, leadSource, stage: stage ?? 'NEW', tag: tag ?? 'NONE', assignedAgentId: assignedAgentId || (session.user as any).id },
      include: { assignedAgent: { select: { id: true, name: true } }, conversation: { include: { messages: true } } },
    })
    // Auto-create conversation
    if (!lead.conversation) {
      await prisma.conversation.create({ data: { leadId: lead.id } })
    }
    return NextResponse.json(lead)
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'A lead with this phone number already exists' }, { status: 409 })
    throw e
  }
}
