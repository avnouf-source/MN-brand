import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { stage, tag, assignedAgentId, conversationStatus } = body
  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(stage && { stage }),
      ...(tag && { tag }),
      ...(assignedAgentId !== undefined && { assignedAgentId }),
      ...(conversationStatus && { conversationStatus }),
    },
    include: { assignedAgent: { select: { id: true, name: true } }, conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.lead.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
