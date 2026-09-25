import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgentWorkspace } from '@/components/agent/AgentWorkspace'
import { generate5000IndianLeads, generate8PerfumeAgents } from '@/lib/bulk-generator'

export const dynamic = 'force-dynamic'

const FALLBACK_QUICK_REPLIES = [
  { id: 'qr1', title: '🌸 Welcome Consultation', body: 'Welcome to B Perfume Haute Parfumerie ⚜️ Would you prefer exploring our Men\'s Collection (featuring CITYMAN Extrait), Women\'s (Velvet Rose), or Unisex (Oud Royale)?' },
  { id: 'qr2', title: '🎩 CITYMAN Extrait (12-Hour)', body: 'CITYMAN Extrait de Parfum is our signature formulation: Italian bergamot, smoked cedar, and white musk with an ultra-potent 12-hour long-lasting sillage. Shall we reserve a 100ml flacon for you?' },
  { id: 'qr3', title: '🌹 Velvet Rose Pour Femme', body: 'Velvet Rose Pour Femme is crafted with Grasse damascena rose, candied amber, and soft musk. Formulated at pure Extrait concentration to last well over 12 hours.' },
  { id: 'qr4', title: '✨ 12-Hour Extrait Formulation', body: 'All B Perfume creations are crafted at Extrait concentration (30%+ perfume oil), guaranteeing a persistent 12-hour sillage and exceptional projection.' },
  { id: 'qr5', title: '📦 India Express VIP Delivery', body: 'Your B Perfume flacon order is confirmed! Dispatched via express courier with insured luxury packaging across Mumbai, Delhi, Bengaluru, and all metro cities within 24-48 hours.' },
]

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = (session.user as any).id
  const role = (session.user as any).role
  const isSuperOrSubAdmin = role === 'ADMIN' || role === 'SUB_ADMIN'

  let leads: any[] = []
  let agents: any[] = []
  let quickReplies: any[] = []

  try {
    const res = await Promise.all([
      prisma.lead.findMany({
        where: isSuperOrSubAdmin ? {} : { assignedAgentId: userId },
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
    console.warn('[Workspace] Database query failed, using 5,000 Indian demo fallback leads:', err)
  }

  // If database has fewer than 10 leads, populate with 5,000 Indian leads & 8 advisors
  if (leads.length < 10) {
    const bulkAgents = generate8PerfumeAgents()
    const bulkLeads = generate5000IndianLeads(bulkAgents)
    if (!isSuperOrSubAdmin) {
      // Strict RBAC: Sales advisors ONLY see their assigned leads (625 leads per advisor)
      const userLeads = bulkLeads.filter(l => l.assignedAgentId === userId)
      leads = userLeads.length > 0
        ? userLeads
        : bulkLeads.slice(0, 625).map(l => ({
            ...l,
            assignedAgentId: userId,
            assignedAgent: { id: userId, name: (session.user as any)?.name || 'Advisor' }
          }))
    } else {
      // Super Admin and Sub-Admins see all 5,000 Indian leads
      leads = bulkLeads
    }
    agents = bulkAgents.map(a => ({ id: a.id, name: a.name, status: a.status }))
  }

  if (agents.length === 0) {
    agents = generate8PerfumeAgents().map(a => ({ id: a.id, name: a.name, status: a.status }))
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
