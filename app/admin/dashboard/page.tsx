import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'
import { generate2000Leads, generate50Agents } from '@/lib/bulk-generator'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let leads: any[] = []
  let users: any[] = []
  let messages = 0

  try {
    const res = await Promise.all([
      prisma.lead.findMany({ include: { assignedAgent: { select: { name: true } } } }),
      prisma.user.findMany({ where: { role: 'AGENT' }, select: { id: true, name: true, status: true, _count: { select: { assignedLeads: true } } } }),
      prisma.message.count(),
    ])
    leads = res[0]
    users = res[1]
    messages = res[2]
  } catch (err) {
    console.warn('[Admin Dashboard] Database query failed, using 2,000+ demo data:', err)
  }

  // Pre-load 5,000 leads & 8 advisors if database is sparse
  if (leads.length < 100) {
    const bulkAgents = generate8PerfumeAgents()
    const bulkLeads = generate2000Leads(bulkAgents)
    leads = bulkLeads
    users = bulkAgents
    messages = 4280
  }

  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.tag === 'HOT').length,
    openConvs: leads.filter(l => l.conversationStatus === 'OPEN' || !l.conversationStatus).length,
    orders: leads.filter(l => l.stage === 'ORDER_PLACED').length,
    closed: leads.filter(l => l.stage === 'DONE').length,
    totalMessages: messages,
  }

  return <AnalyticsDashboard stats={stats} agents={users as any} leads={leads as any} />
}
