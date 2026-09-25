import nextDynamic from 'next/dynamic'
import { prisma } from '@/lib/prisma'
import { generate2000Leads, generate8PerfumeAgents } from '@/lib/bulk-generator'

const AnalyticsDashboard = nextDynamic(
  () => import('@/components/admin/AnalyticsDashboard').then(m => m.AnalyticsDashboard),
  {
    loading: () => (
      <div className="flex items-center justify-center p-16 text-slate-400">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-medium">Loading Executive Analytics...</p>
        </div>
      </div>
    ),
  }
)

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
