import { prisma } from '@/lib/prisma'
import { TeamManager } from '@/components/admin/TeamManager'

export const dynamic = 'force-dynamic'

const FALLBACK_AGENTS = [
  { id: 'sara-demo-id', name: 'Sara Johnson', email: 'sara@mnbrand.com', department: 'Sales', status: 'ONLINE', _count: { assignedLeads: 3 } },
  { id: 'karim-demo-id', name: 'Karim Al-Hassan', email: 'karim@mnbrand.com', department: 'Business Dev', status: 'ONLINE', _count: { assignedLeads: 3 } },
]

export default async function TeamPage() {
  let agents: any[] = []
  try {
    agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: { id: true, name: true, email: true, department: true, status: true, _count: { select: { assignedLeads: true } } },
      orderBy: { createdAt: 'asc' }
    })
  } catch (err) {
    console.warn('[TeamPage] Database query failed, using demo fallback:', err)
  }

  if (agents.length === 0) agents = FALLBACK_AGENTS

  return <TeamManager initialAgents={agents as any} />
}
