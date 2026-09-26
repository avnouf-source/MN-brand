import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { stage, tag, label, assignedAgentId, conversationStatus, notes } = body
  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(stage && { stage }),
      ...(tag && { tag }),
      ...(label && { label }),
      ...(assignedAgentId !== undefined && { assignedAgentId }),
      ...(conversationStatus && { conversationStatus }),
      ...(notes !== undefined && { notes }),
    },
    include: { assignedAgent: { select: { id: true, name: true } }, conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } } },
  })

  // Register in Enterprise Audit Trail
  try {
    const agent = session.user as any
    const actionDesc = stage
      ? `Lead Stage Transition: ${stage}`
      : label
      ? `Lead Label Updated: ${label}`
      : notes
      ? `Note Added`
      : `Lead Updated`
    await logAuditEvent({
      agentId: agent.id || 'agent',
      agentName: agent.name || 'Sales Agent',
      action: actionDesc,
      target: `Lead #${id.slice(-6)} (${updated.name})`,
      severity: 'INFO',
      details: JSON.stringify({ stage, tag, label, assignedAgentId, notes }),
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    })
  } catch (err) {
    console.warn('[Audit Log] Lead PATCH log error:', err)
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const existing = await prisma.lead.findUnique({ where: { id }, select: { name: true } })
  await prisma.lead.delete({ where: { id } })

  // Log deletion in audit trail
  try {
    const admin = session.user as any
    await logAuditEvent({
      agentId: admin.id || 'admin',
      agentName: admin.name || 'Super Admin',
      action: 'Lead Record Deleted',
      target: `Lead #${id.slice(-6)} (${existing?.name || 'Unknown'})`,
      severity: 'WARNING',
      details: `Lead permanently purged from CRM database`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    })
  } catch (err) {
    console.warn('[Audit Log] Lead DELETE log error:', err)
  }

  return NextResponse.json({ success: true })
}

