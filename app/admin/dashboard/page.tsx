import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [leads, users, messages] = await Promise.all([
    prisma.lead.findMany({ include: { assignedAgent: { select: { name: true } } } }),
    prisma.user.findMany({ where: { role: 'AGENT' }, select: { id: true, name: true, status: true, _count: { select: { assignedLeads: true } } } }),
    prisma.message.count(),
  ])
  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.tag === 'HOT').length,
    openConvs: leads.filter(l => l.conversationStatus === 'OPEN').length,
    orders: leads.filter(l => l.stage === 'ORDER_PLACED').length,
    closed: leads.filter(l => l.stage === 'DONE').length,
    totalMessages: messages,
  }
  return <AnalyticsDashboard stats={stats} agents={users as any} leads={leads as any} />
}
