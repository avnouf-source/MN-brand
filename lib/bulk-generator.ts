import { COUNTRIES } from './countries'

const FIRST_NAMES = [
  'Alexander', 'Sarah', 'Mohammed', 'Elena', 'Lucas', 'Fatima', 'David', 'Chloe', 'Omar', 'Yuki',
  'Carlos', 'Amira', 'James', 'Aya', 'Matteo', 'Liam', 'Zainab', 'Noah', 'Camila', 'Tariq',
  'Oliver', 'Sophia', 'Hassan', 'Isabella', 'William', 'Layla', 'Benjamin', 'Mia', 'Ali', 'Emma',
  'Mason', 'Harper', 'Ibrahim', 'Evelyn', 'Elijah', 'Abigail', 'Yusuf', 'Emily', 'Daniel', 'Avery',
  'Sebastian', 'Ella', 'Jackson', 'Scarlett', 'Aiden', 'Grace', 'Matthew', 'Lily', 'Samuel', 'Chloe'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
]

const COMPANY_PREFIXES = ['Apex', 'Vertex', 'Starlight', 'Horizon', 'Global', 'Prime', 'Omni', 'Nexus', 'Vanguard', 'Beacon']
const COMPANY_SUFFIXES = ['Ventures', 'Holdings', 'Capital', 'Group', 'Enterprises', 'Logistics', 'Solutions', 'Investments', 'Technologies', 'Consulting']

const REQUIREMENTS = [
  'B2B international lead generation campaign for European market',
  'Automated WhatsApp CRM workflow setup and team onboarding',
  'Real estate investor acquisition pipeline across GCC and UAE',
  'Outbound marketing automation and customer support delegation',
  'High-ticket coaching client acquisition and WhatsApp qualification',
  'Enterprise CRM migration with customized multi-country dialing',
  'E-commerce customer retention & abandoned cart WhatsApp reminders',
  'Fintech product launch and international partner outreach'
]

const SOURCES = ['LinkedIn', 'WhatsApp', 'Instagram', 'Website', 'Referral', 'TikTok', 'Trade Show']
const STAGES = ['NEW', 'TALKING', 'ORDER_PLACED', 'DONE']
const TAGS = ['HOT', 'WARM', 'COLD', 'NONE']
const STATUSES = ['OPEN', 'WAITING', 'UNREAD', 'CLOSED']

export interface GeneratedLead {
  id: string
  name: string
  phone: string
  email: string
  company: string
  businessRequirement: string
  leadSource: string
  stage: string
  tag: string
  conversationStatus: string
  assignedAgentId?: string
  assignedAgent?: { id: string; name: string }
  updatedAt: string
  conversation?: {
    id: string
    messages: {
      id: string
      body: string
      direction: string
      type: string
      senderType: string
      isRead: boolean
      createdAt: string
    }[]
  }
}

export interface GeneratedAgent {
  id: string
  name: string
  email: string
  department: string
  status: string
  _count: { assignedLeads: number }
}

export function generate50Agents(): GeneratedAgent[] {
  const departments = ['Sales', 'Business Dev', 'Enterprise', 'Support', 'VIP Accounts']
  const agents: GeneratedAgent[] = []

  for (let i = 1; i <= 50; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length]
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length]
    const name = `${fn} ${ln}`
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@mnbrand.com`
    const dept = departments[i % departments.length]

    agents.push({
      id: `agent-mn-${i}`,
      name,
      email,
      department: dept,
      status: i % 4 === 0 ? 'OFFLINE' : 'ONLINE',
      _count: { assignedLeads: 0 },
    })
  }

  return agents
}

export function generate2000Leads(agents?: GeneratedAgent[]): GeneratedLead[] {
  const leads: GeneratedLead[] = []
  const agentList = agents && agents.length > 0 ? agents : generate50Agents()

  for (let i = 1; i <= 2000; i++) {
    const country = COUNTRIES[i % COUNTRIES.length]
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length]
    const ln = LAST_NAMES[(i * 11) % LAST_NAMES.length]
    const name = `${fn} ${ln}`
    const rawNumber = 10000000 + ((i * 987654) % 89999999)
    const phone = `${country.dial}${rawNumber}`
    const comp = `${COMPANY_PREFIXES[i % COMPANY_PREFIXES.length]} ${COMPANY_SUFFIXES[(i * 2) % COMPANY_SUFFIXES.length]}`
    const req = REQUIREMENTS[i % REQUIREMENTS.length]
    const stage = STAGES[i % STAGES.length]
    const tag = TAGS[i % TAGS.length]
    const status = STATUSES[i % STATUSES.length]
    const source = SOURCES[i % SOURCES.length]

    // Equal assignment: 2000 leads / 50 agents = 40 leads per agent
    const assignedAgent = agentList[(i - 1) % agentList.length]
    if (assignedAgent) {
      assignedAgent._count.assignedLeads++
    }

    const messages = [
      {
        id: `msg-${i}-1`,
        body: `Inquiry regarding: ${req}. Please share your business proposal.`,
        direction: 'INBOUND',
        type: 'TEXT',
        senderType: 'customer',
        isRead: status !== 'UNREAD',
        createdAt: new Date(Date.now() - (i % 48) * 3600000).toISOString(),
      },
      {
        id: `msg-${i}-2`,
        body: `Hi ${fn}! Thank you for reaching out to MN Brand. A dedicated manager from our ${assignedAgent?.department || 'Sales'} division is on it.`,
        direction: 'OUTBOUND',
        type: 'BOT',
        senderType: 'bot',
        isRead: true,
        createdAt: new Date(Date.now() - ((i % 48) * 3600000) + 60000).toISOString(),
      }
    ]

    leads.push({
      id: `lead-bulk-${i}`,
      name,
      phone,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${comp.toLowerCase().replace(/\s+/g, '')}.com`,
      company: comp,
      businessRequirement: req,
      leadSource: source,
      stage,
      tag,
      conversationStatus: status,
      assignedAgentId: assignedAgent?.id,
      assignedAgent: assignedAgent ? { id: assignedAgent.id, name: assignedAgent.name } : undefined,
      updatedAt: new Date(Date.now() - (i % 72) * 3600000).toISOString(),
      conversation: {
        id: `conv-bulk-${i}`,
        messages,
      }
    })
  }

  return leads
}
