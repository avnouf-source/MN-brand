import { prisma } from '@/lib/prisma'
import { TeamManager } from '@/components/admin/TeamManager'
import { generate8PerfumeAgents } from '@/lib/bulk-generator'

export const dynamic = 'force-dynamic'

const APPROVED_AGENT_EMAILS = [
  'adarsh@bperfume.com',
  'fathimathshifa@bperfume.com',
  'nandana@bperfume.com',
  'nouf@bperfume.com',
  'rizvan@bperfume.com',
  'sajila@bperfume.com',
  'sajna@bperfume.com',
  'salih@bperfume.com',
]

export default async function TeamPage() {
  let agents: any[] = []
  try {
    agents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        email: { in: APPROVED_AGENT_EMAILS },
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        status: true,
        _count: { select: { assignedLeads: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  } catch (err) {
    console.warn('[TeamPage] Database query failed, using official 8 agents fallback:', err)
  }

  // Ensure strictly the 8 approved agents are rendered
  if (agents.length === 0) {
    agents = generate8PerfumeAgents()
  }

  return <TeamManager initialAgents={agents as any} />
}
