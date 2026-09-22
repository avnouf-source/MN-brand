import { prisma } from '@/lib/prisma'
import { TeamManager } from '@/components/admin/TeamManager'

export default async function TeamPage() {
  const agents = await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: { id: true, name: true, email: true, department: true, status: true, _count: { select: { assignedLeads: true } } },
    orderBy: { createdAt: 'asc' }
  })
  return <TeamManager initialAgents={agents as any} />
}
