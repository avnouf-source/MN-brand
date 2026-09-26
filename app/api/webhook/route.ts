import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Universal Omnichannel Webhook:
 * Supports Meta WhatsApp Cloud API, Instagram Direct Messages, and Facebook Messenger
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')
  const mode = req.nextUrl.searchParams.get('hub.mode')

  const config = await prisma.whatsAppConfig.findFirst()
  const expectedToken = config?.webhookVerifyToken || 'mnbrand-webhook-verify-2024'

  if (mode === 'subscribe' && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const objectType = body?.object // 'whatsapp_business_account' | 'instagram' | 'page'

    // 1. Meta WhatsApp Cloud API Entry
    if (objectType === 'whatsapp_business_account' || body?.entry?.[0]?.changes?.[0]?.value?.messages) {
      const entry = body?.entry?.[0]
      const changes = entry?.changes?.[0]
      const message = changes?.value?.messages?.[0]
      if (!message) return NextResponse.json({ status: 'no message' })

      const phone = message.from.startsWith('+') ? message.from : `+${message.from}`
      const text = message.text?.body ?? message.caption ?? 'Inbound message'

      let lead = await prisma.lead.findUnique({ where: { phone }, include: { conversation: true } })
      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            name: `Guest (${phone.slice(-4)})`,
            phone,
            leadSource: 'WhatsApp',
            stage: 'NEW',
            tag: 'WARM',
            label: 'NEW_LEAD',
          },
          include: { conversation: true },
        }) as any
      }

      let convId = (lead as any).conversation?.id
      if (!convId) {
        const conv = await prisma.conversation.create({ data: { leadId: lead!.id } })
        convId = conv.id
      }

      await prisma.message.create({
        data: {
          conversationId: convId,
          body: text,
          direction: 'INBOUND',
          type: 'TEXT',
          senderType: 'customer',
        },
      })
      await prisma.conversation.update({ where: { id: convId }, data: { lastMessageAt: new Date() } })
      return NextResponse.json({ status: 'ok', channel: 'whatsapp' })
    }

    // 2. Instagram Direct Messages Webhook
    if (objectType === 'instagram' || body?.entry?.[0]?.messaging?.[0]?.message) {
      const messaging = body?.entry?.[0]?.messaging?.[0]
      const senderId = messaging?.sender?.id
      const text = messaging?.message?.text || 'Sent an attachment / story reply'
      if (!senderId) return NextResponse.json({ status: 'no instagram sender' })

      const virtualPhone = `+9199IG${senderId.slice(-8)}`
      let lead = await prisma.lead.findUnique({ where: { phone: virtualPhone }, include: { conversation: true } })
      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            name: `@ig_user_${senderId.slice(-4)}`,
            phone: virtualPhone,
            leadSource: 'Instagram',
            stage: 'NEW',
            tag: 'HOT',
            label: 'NEW_LEAD',
          },
          include: { conversation: true },
        }) as any
      }

      let convId = (lead as any).conversation?.id
      if (!convId) {
        const conv = await prisma.conversation.create({ data: { leadId: lead!.id } })
        convId = conv.id
      }

      await prisma.message.create({
        data: {
          conversationId: convId,
          body: `📷 [Instagram DM] ${text}`,
          direction: 'INBOUND',
          type: 'TEXT',
          senderType: 'customer',
        },
      })
      await prisma.conversation.update({ where: { id: convId }, data: { lastMessageAt: new Date() } })

      await logAuditEvent({
        agentId: 'system-ig',
        agentName: 'Instagram Webhook',
        action: 'Omnichannel Inbound Message',
        target: `Instagram Lead (${lead.name})`,
        severity: 'INFO',
        details: text,
      })

      return NextResponse.json({ status: 'ok', channel: 'instagram' })
    }

    // 3. Facebook Messenger Webhook
    if (objectType === 'page' || body?.entry?.[0]?.messaging) {
      const messaging = body?.entry?.[0]?.messaging?.[0]
      const senderId = messaging?.sender?.id
      const text = messaging?.message?.text || 'Sent a message via Messenger'
      if (!senderId) return NextResponse.json({ status: 'no messenger sender' })

      const virtualPhone = `+9198FB${senderId.slice(-8)}`
      let lead = await prisma.lead.findUnique({ where: { phone: virtualPhone }, include: { conversation: true } })
      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            name: `FB Guest ${senderId.slice(-4)}`,
            phone: virtualPhone,
            leadSource: 'Messenger',
            stage: 'NEW',
            tag: 'WARM',
            label: 'NEW_LEAD',
          },
          include: { conversation: true },
        }) as any
      }

      let convId = (lead as any).conversation?.id
      if (!convId) {
        const conv = await prisma.conversation.create({ data: { leadId: lead!.id } })
        convId = conv.id
      }

      await prisma.message.create({
        data: {
          conversationId: convId,
          body: `💬 [Facebook Messenger] ${text}`,
          direction: 'INBOUND',
          type: 'TEXT',
          senderType: 'customer',
        },
      })
      await prisma.conversation.update({ where: { id: convId }, data: { lastMessageAt: new Date() } })

      return NextResponse.json({ status: 'ok', channel: 'messenger' })
    }

    return NextResponse.json({ status: 'unhandled webhook payload' })
  } catch (error: any) {
    console.error('[Omnichannel Webhook Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
