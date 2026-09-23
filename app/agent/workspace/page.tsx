import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgentWorkspace } from '@/components/agent/AgentWorkspace'
import { generate2000Leads, generate50Agents } from '@/lib/bulk-generator'

export const dynamic = 'force-dynamic'

const FALLBACK_QUICK_REPLIES = [
  { id: 'qr1', title: 'Welcome Greeting', body: 'Welcome to MN Brand! 👋 How can we help your business grow today?' },
  { id: 'qr2', title: 'Schedule Discovery Call', body: "Thank you for reaching out! Let's schedule a discovery call this week." },
  { id: 'qr3', title: 'Send Service Deck', body: 'Great news! Your customized proposal from MN Brand is ready.' },
  { id: 'qr4', title: 'Lead Qualification', body: 'Could you share your approximate monthly target for qualified leads?' },
  { id: 'qr5', title: 'Pricing & Tiers', body: 'Our enterprise packages start with full WhatsApp pipeline management.' },
]

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'

  let leads: any[] = []
  let agents: any[] = []
  let quickReplies: any[] = []

  try {
    const res = await Promise.all([
      prisma.lead.findMany({
        where: isAdmin ? {} : { assignedAgentId: userId },
        include: {
          assignedAgent: { select: { id: true, name: true } },
          conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.user.findMany({
        where: { role: 'AGENT' },
        select: { id: true, name: true, status: true }
      }),
      prisma.quickReply.findMany({ orderBy: { createdAt: 'asc' } }),
    ])
    leads = res[0]
    agents = res[1]
    quickReplies = res[2]
  } catch (err) {
    console.warn('[Workspace] Database query failed, using 2,000+ demo fallback leads:', err)
  }

  // If database has fewer than 10 leads, populate with 2,000+ international leads & 50 agents
  if (leads.length < 10) {
    const bulkAgents = generate50Agents()
    const bulkLeads = generate2000Leads(bulkAgents)
    leads = bulkLeads
    agents = bulkAgents.map(a => ({ id: a.id, name: a.name, status: a.status }))
  }

  if (agents.length === 0) {
    agents = generate50Agents().map(a => ({ id: a.id, name: a.name, status: a.status }))
  }

  if (quickReplies.length === 0) {
    quickReplies = FALLBACK_QUICK_REPLIES
  }

  return (
    <AgentWorkspace
      initialLeads={leads as any}
      agents={agents}
      quickReplies={quickReplies}
      currentUserId={userId}
    />
  )
}
