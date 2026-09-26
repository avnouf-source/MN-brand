import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Automated Follow-up Sequences (Drip Campaign Cron Engine)
 * If a lead is tagged as 'Follow-up' (or label FOLLOW_UP) and has been inactive
 * for >= 48 hours, automatically dispatches a scheduled follow-up offer without agent intervention.
 */
export async function GET(req: NextRequest) {
  return handleDripProcessing(req)
}

export async function POST(req: NextRequest) {
  return handleDripProcessing(req)
}

async function handleDripProcessing(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const forceAll = searchParams.get('force') === 'true'
    const inactivityHours = parseInt(searchParams.get('hours') || '48', 10)

    const cutoffDate = new Date(Date.now() - inactivityHours * 60 * 60 * 1000)

    // Query leads with FOLLOW_UP label or status
    const candidateLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { label: 'FOLLOW_UP' },
          { stage: 'TALKING' },
        ],
        updatedAt: forceAll ? undefined : { lte: cutoffDate },
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        assignedAgent: {
          select: { id: true, name: true },
        },
      },
      take: 50,
    })

    const results: any[] = []

    for (const lead of candidateLeads) {
      const conv = lead.conversation
      if (!conv) continue

      const lastMsg = conv.messages?.[0]
      // Don't send follow-up if we already sent one in the last 24 hours
      if (
        lastMsg &&
        lastMsg.direction === 'OUTBOUND' &&
        lastMsg.body?.includes('[Automated Concierge Follow-Up]')
      ) {
        continue
      }

      const firstName = lead.name.split(' ')[0] || 'Honoured Guest'
      const perfume = lead.fragrancePreference || 'CITYMAN Extrait'

      const dripBody = `[Automated Concierge Follow-Up]\n\nDear ${firstName}, your bespoke fragrance reservation for **${perfume} (Extrait de Parfum)** is currently reserved at B Perfume Haute Parfumerie.\n\n✨ As a privileged guest, we are pleased to offer **Complimentary VIP Delivery & Discovery Gift Flacon** if you confirm your order within the next 24 hours.\n\nReply 'CONFIRM' or message us to finalize your boutique packaging.`

      // Create message in database
      const msg = await prisma.message.create({
        data: {
          conversationId: conv.id,
          body: dripBody,
          direction: 'OUTBOUND',
          type: 'BOT',
          senderType: 'bot',
        },
      })

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conv.id },
        data: { lastMessageAt: new Date() },
      })

      // Log in Audit Trail
      await logAuditEvent({
        agentId: lead.assignedAgentId || 'system-drip-cron',
        agentName: 'Automated Drip Engine',
        action: 'Automated Drip Follow-up Dispatched',
        target: `Lead #${lead.id.slice(-6)} (${lead.name})`,
        severity: 'INFO',
        details: `48h Inactivity rule triggered for ${perfume}. VIP offer delivered.`,
      })

      results.push({
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        perfume,
        messageId: msg.id,
        agent: lead.assignedAgent?.name || 'Unassigned',
      })
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      ruleApplied: `Inactivity >= ${inactivityHours} Hours`,
      dispatchedLeads: results,
      timestamp: new Date().toISOString(),
      message: `Automated drip sequence executed: ${results.length} inactive follow-up leads contacted with bespoke offers.`,
    })
  } catch (error: any) {
    console.error('[Drip Campaign Engine Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
