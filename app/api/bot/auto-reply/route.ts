import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAIAutoReply } from '@/lib/ai-assistant'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { leadId, customerMessage } = await req.json()
    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { conversation: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const replyText = generateAIAutoReply(
      {
        name: lead.name,
        company: lead.company || undefined,
        businessRequirement: lead.businessRequirement || undefined,
        leadSource: lead.leadSource || undefined,
      },
      customerMessage
    )

    let convId = lead.conversation?.id
    if (!convId) {
      const conv = await prisma.conversation.create({ data: { leadId } })
      convId = conv.id
    }

    const aiMessage = await prisma.message.create({
      data: {
        conversationId: convId,
        body: replyText,
        direction: 'OUTBOUND',
        type: 'BOT',
        senderType: 'ai_assistant',
      }
    })

    return NextResponse.json({ success: true, message: aiMessage })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate auto-reply' }, { status: 500 })
  }
}
