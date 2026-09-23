import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgentWorkspace } from '@/components/agent/AgentWorkspace'

export const dynamic = 'force-dynamic'

const FALLBACK_AGENTS = [
  { id: 'sara-demo-id', name: 'Sara Johnson', status: 'ONLINE' },
  { id: 'karim-demo-id', name: 'Karim Al-Hassan', status: 'ONLINE' },
]

const FALLBACK_QUICK_REPLIES = [
  { id: 'qr1', title: 'Welcome', body: 'Welcome to MN Brand! 👋 How can we help your business grow today?' },
  { id: 'qr2', title: 'Discovery Call', body: "Thank you for reaching out! Let's schedule a discovery call this week." },
  { id: 'qr3', title: 'Proposal Ready', body: 'Great news! Your customized proposal from MN Brand is ready.' },
]

const FALLBACK_LEADS = [
  {
    id: 'lead-1',
    name: 'James Mitchell',
    phone: '+447911123456',
    tag: 'HOT',
    stage: 'TALKING',
    conversationStatus: 'OPEN',
    company: 'Mitchell & Co',
    businessRequirement: 'Lead generation for UK property market',
    leadSource: 'LinkedIn',
    updatedAt: new Date().toISOString(),
    assignedAgent: { id: 'sara-demo-id', name: 'Sara Johnson' },
    conversation: {
      id: 'conv-1',
      messages: [
        { id: 'm1', body: 'Hi, I need lead generation for UK property market.', direction: 'INBOUND', type: 'TEXT', senderType: 'customer', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: true },
        { id: 'm2', body: 'Hello James! Welcome to MN Brand. We would love to discuss your campaign.', direction: 'OUTBOUND', type: 'TEXT', senderType: 'agent', createdAt: new Date(Date.now() - 1800000).toISOString(), isRead: true }
      ]
    }
  },
  {
    id: 'lead-2',
    name: 'Aisha Al-Farsi',
    phone: '+971501234567',
    tag: 'HOT',
    stage: 'ORDER_PLACED',
    conversationStatus: 'WAITING',
    company: 'Al-Farsi Investments',
    businessRequirement: 'CRM system for Dubai real estate',
    leadSource: 'Instagram',
    updatedAt: new Date().toISOString(),
    assignedAgent: { id: 'sara-demo-id', name: 'Sara Johnson' },
    conversation: {
      id: 'conv-2',
      messages: [
        { id: 'm3', body: 'Can we schedule a consultation call tomorrow?', direction: 'INBOUND', type: 'TEXT', senderType: 'customer', createdAt: new Date(Date.now() - 7200000).toISOString(), isRead: true },
        { id: 'm4', body: 'Proposal sent over WhatsApp. Awaiting your confirmation.', direction: 'OUTBOUND', type: 'TEXT', senderType: 'agent', createdAt: new Date(Date.now() - 900000).toISOString(), isRead: true }
      ]
    }
  },
  {
    id: 'lead-3',
    name: 'Carlos Mendez',
    phone: '+5511987654321',
    tag: 'WARM',
    stage: 'TALKING',
    conversationStatus: 'UNREAD',
    company: 'Mendez Group',
    businessRequirement: 'B2B lead generation Brazil',
    leadSource: 'WhatsApp',
    updatedAt: new Date().toISOString(),
    assignedAgent: { id: 'karim-demo-id', name: 'Karim Al-Hassan' },
    conversation: {
      id: 'conv-3',
      messages: [
        { id: 'm5', body: 'Hello! Are you active in Latin America?', direction: 'INBOUND', type: 'TEXT', senderType: 'customer', createdAt: new Date().toISOString(), isRead: false }
      ]
    }
  },
  {
    id: 'lead-4',
    name: 'Sophie Laurent',
    phone: '+33612345678',
    tag: 'WARM',
    stage: 'NEW',
    conversationStatus: 'OPEN',
    company: 'Laurent Conseil',
    businessRequirement: 'Marketing automation for French SMEs',
    leadSource: 'Referral',
    updatedAt: new Date().toISOString(),
    assignedAgent: { id: 'karim-demo-id', name: 'Karim Al-Hassan' },
    conversation: {
      id: 'conv-4',
      messages: [
        { id: 'm6', body: 'Bonjour, I saw your portfolio and would like more details.', direction: 'INBOUND', type: 'TEXT', senderType: 'customer', createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true }
      ]
    }
  },
  {
    id: 'lead-5',
    name: 'Raj Patel',
    phone: '+919876543210',
    tag: 'COLD',
    stage: 'NEW',
    conversationStatus: 'OPEN',
    company: 'Patel Tech',
    businessRequirement: 'Sales funnel optimization',
    leadSource: 'Website',
    updatedAt: new Date().toISOString(),
    assignedAgent: { id: 'sara-demo-id', name: 'Sara Johnson' },
    conversation: {
      id: 'conv-5',
      messages: [
        { id: 'm7', body: 'Inquiring about global pricing plans.', direction: 'INBOUND', type: 'TEXT', senderType: 'customer', createdAt: new Date(Date.now() - 172800000).toISOString(), isRead: true }
      ]
    }
  },
  {
    id: 'lead-6',
    name: 'Emma Schulz',
    phone: '+491701234567',
    tag: 'HOT',
    stage: 'DONE',
    conversationStatus: 'CLOSED',
    company: 'Schulz GmbH',
    businessRequirement: 'Enterprise CRM integration',
    leadSource: 'LinkedIn',
    updatedAt: new Date().toISOString(),
    assignedAgent: { id: 'karim-demo-id', name: 'Karim Al-Hassan' },
    conversation: {
      id: 'conv-6',
      messages: [
        { id: 'm8', body: 'Contract signed! Thank you for the quick onboarding.', direction: 'INBOUND', type: 'TEXT', senderType: 'customer', createdAt: new Date(Date.now() - 250000000).toISOString(), isRead: true }
      ]
    }
  }
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
    console.warn('[Workspace] Database query failed, using demo fallback data:', err)
  }

  // If database is empty (e.g. unseeded Netlify instance), provide demo leads
  if (leads.length === 0) {
    leads = FALLBACK_LEADS
  }
  if (agents.length === 0) {
    agents = FALLBACK_AGENTS
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
