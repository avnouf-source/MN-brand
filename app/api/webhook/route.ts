import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')
  const config = await prisma.whatsAppConfig.findFirst()
  if (token === config?.webhookVerifyToken) return new NextResponse(challenge, { status: 200 })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = body?.entry?.[0]
  const changes = entry?.changes?.[0]
  const message = changes?.value?.messages?.[0]
  if (!message) return NextResponse.json({ status: 'no message' })

  const phone = message.from
  const text = message.text?.body ?? ''

  let lead = await prisma.lead.findUnique({ where: { phone: `+${phone}` }, include: { conversation: true } })
  if (!lead) {
    lead = await prisma.lead.create({ data: { name: `+${phone}`, phone: `+${phone}` }, include: { conversation: true } }) as any
  }
  let convId = (lead as any).conversation?.id
  if (!convId) {
    const conv = await prisma.conversation.create({ data: { leadId: lead!.id } })
    convId = conv.id
  }
  await prisma.message.create({ data: { conversationId: convId, body: text, direction: 'INBOUND', type: 'TEXT', senderType: 'customer' } })
  await prisma.conversation.update({ where: { id: convId }, data: { lastMessageAt: new Date() } })
  return NextResponse.json({ status: 'ok' })
}
