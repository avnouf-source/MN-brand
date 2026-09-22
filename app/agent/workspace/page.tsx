import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgentWorkspace } from '@/components/agent/AgentWorkspace'

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'

  const [leads, agents, quickReplies] = await Promise.all([
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

  return (
    <AgentWorkspace
      initialLeads={leads as any}
      agents={agents}
      quickReplies={quickReplies}
      currentUserId={userId}
    />
  )
}
