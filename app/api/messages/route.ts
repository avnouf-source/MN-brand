import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { leadId, body, type } = await req.json()
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { conversation: true } })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  let convId = lead.conversation?.id
  if (!convId) {
    const conv = await prisma.conversation.create({ data: { leadId } })
    convId = conv.id
  }

  const message = await prisma.message.create({
    data: {
      conversationId: convId,
      body,
      direction: 'OUTBOUND',
      type: type ?? 'TEXT',
      senderType: type === 'NOTE' ? 'system' : 'agent',
      senderId: (session.user as any).id,
    },
  })

  await prisma.conversation.update({ where: { id: convId }, data: { lastMessageAt: new Date() } })
  return NextResponse.json(message)
}
