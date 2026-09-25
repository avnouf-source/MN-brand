// B Perfume Haute Parfumerie Bulk Generator
// 8 Sales Agents & 5,000 Indian (+91) Demo Leads

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Pooja', 'Rajesh', 'Sneha',
  'Aditya', 'Kavita', 'Arjun', 'Meera', 'Siddharth', 'Divya', 'Kabir', 'Ishaan',
  'Nisha', 'Rahul', 'Simran', 'Karan', 'Tanvi', 'Manish', 'Neha', 'Gaurav',
  'Shreya', 'Amit', 'Rhea', 'Dev', 'Anushka', 'Vivek', 'Ritu', 'Sameer',
  'Pallavi', 'Akash', 'Swati', 'Harsh', 'Isha', 'Varun', 'Deepika', 'Kunal',
  'Pooja', 'Nikhil', 'Sunita', 'Pranav', 'Payal', 'Yash', 'Shruti', 'Alok'
]

const INDIAN_LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Iyer', 'Mehta', 'Nair', 'Gupta', 'Mukherjee',
  'Reddy', 'Singh', 'Malhotra', 'Joshi', 'Chopra', 'Rao', 'Bose', 'Kapoor',
  'Deshmukh', 'Menon', 'Bhatia', 'Saxena', 'Kulkarni', 'Agarwal', 'Chatterjee',
  'Choudhury', 'Sen', 'Pillai', 'Singhania', 'Mittal', 'Pandey', 'Dutta',
  'Goswami', 'Acharya', 'Trivedi', 'Thakur', 'Bhardwaj', 'Mishra', 'Shetty'
]

const INDIAN_CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Kochi', 'Surat', 'Lucknow', 'Indore'
]

export const PERFUME_PRODUCTS = [
  'CITYMAN Extrait de Parfum (100ml / 12-Hour Long-Lasting)',
  'Oud Royale Extrait (50ml / 12-Hour Pure Oud)',
  'Velvet Rose Pour Femme (100ml / 12-Hour Luxury)',
  'Amber Blanc Luxury Edition (100ml / Extrait)',
  'Santal Imperial Unisex (100ml / 12-Hour)',
  'Citrus Riviera Extrait (100ml / Fresh Unisex)',
]

export const PERFUME_STAGES = [
  'NEW_INQUIRY',
  'SCENT_RECOMMENDATION',
  'ORDER_PLACED',
  'SHIPPED',
  'DELIVERED',
] as const

const TAGS = ['HOT', 'WARM', 'COLD', 'NONE']
const STATUSES = ['OPEN', 'WAITING', 'UNREAD', 'CLOSED']
const SOURCES = ['WhatsApp Direct', 'Instagram Luxury Ad', 'B Perfume Boutique', 'VIP Referral', 'Website Consultation']

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
  country?: string
  assignedAgentId?: string
  assignedAgent?: { id: string; name: string }
  updatedAt: string
  conversation?: {
    id: string
    messages: any[]
  }
}

export interface GeneratedAgent {
  id: string
  name: string
  email: string
  department: string
  status: string
  role?: string
  _count: { assignedLeads: number }
}

// Exactly 8 Sales Agents for B Perfume
export const B_PERFUME_8_AGENTS: { id: string; name: string; email: string; department: string }[] = [
  { id: 'agent-bperfume-1', name: 'Adarsh', email: 'adarsh@bperfume.com', department: 'Signature Scents (CITYMAN)' },
  { id: 'agent-bperfume-2', name: 'Fathimath Shifa', email: 'fathimathshifa@bperfume.com', department: 'Women Fragrance Curation' },
  { id: 'agent-bperfume-3', name: 'Nandana', email: 'nandana@bperfume.com', department: 'Private Client Scent Stylist' },
  { id: 'agent-bperfume-4', name: 'Nouf', email: 'nouf@bperfume.com', department: 'VIP Client Advisor' },
  { id: 'agent-bperfume-5', name: 'Rizvan', email: 'rizvan@bperfume.com', department: 'Oriental & Oud Parfums' },
  { id: 'agent-bperfume-6', name: 'Sajila', email: 'sajila@bperfume.com', department: 'Luxury Scent Concierge' },
  { id: 'agent-bperfume-7', name: 'Sajna', email: 'sajna@bperfume.com', department: 'Bespoke Haute Parfumerie' },
  { id: 'agent-bperfume-8', name: 'Salih', email: 'salih@bperfume.com', department: 'Extrait Prestige Sales' },
]

export function generate8PerfumeAgents(): GeneratedAgent[] {
  return B_PERFUME_8_AGENTS.map((a, i) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    department: a.department,
    status: i % 4 === 0 ? 'OFFLINE' : 'ONLINE',
    role: 'AGENT',
    _count: { assignedLeads: 625 }, // 5000 / 8 = 625
  }))
}

// Backward compatibility alias
export function generate50Agents(): GeneratedAgent[] {
  return generate8PerfumeAgents()
}

// Generate exactly 5,000 Indian Leads (+91) with fresh clean chat history
export function generate5000IndianLeads(agents?: GeneratedAgent[]): GeneratedLead[] {
  const agentList = agents && agents.length > 0 ? agents : generate8PerfumeAgents()
  const leads: GeneratedLead[] = []

  // Prefixes common in Indian mobile carriers (98, 97, 99, 96, 95, 94, 93, 91, 88, 70)
  const carrierPrefixes = ['9820', '9811', '9845', '9830', '9880', '9900', '9711', '9822', '9890', '9740']

  for (let i = 1; i <= 5000; i++) {
    const fn = INDIAN_FIRST_NAMES[(i * 7) % INDIAN_FIRST_NAMES.length]
    const ln = INDIAN_LAST_NAMES[(i * 11) % INDIAN_LAST_NAMES.length]
    const city = INDIAN_CITIES[(i * 3) % INDIAN_CITIES.length]
    const name = `${fn} ${ln}`
    
    // Strict Indian Phone Number: +91 + 10 digits
    const prefix = carrierPrefixes[i % carrierPrefixes.length]
    const suffix = String(100000 + ((i * 49157) % 899999)).padStart(6, '0')
    const phone = `+91${prefix}${suffix}`

    const product = PERFUME_PRODUCTS[i % PERFUME_PRODUCTS.length]
    const stage = PERFUME_STAGES[i % PERFUME_STAGES.length]
    const tag = TAGS[i % TAGS.length]
    const status = STATUSES[i % STATUSES.length]
    const source = SOURCES[i % SOURCES.length]

    // Equal round-robin distribution: 5000 / 8 = 625 per agent
    const assignedAgent = agentList[(i - 1) % agentList.length]
    if (assignedAgent) {
      assignedAgent._count.assignedLeads = (assignedAgent._count.assignedLeads || 0) + 1
    }

    leads.push({
      id: `lead-in-${i}`,
      name,
      phone,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 100}@gmail.com`,
      company: `Client · ${city}`,
      businessRequirement: `Requested consultation for ${product}`,
      leadSource: source,
      stage,
      tag,
      conversationStatus: status,
      country: 'IN',
      assignedAgentId: assignedAgent?.id,
      assignedAgent: assignedAgent ? { id: assignedAgent.id, name: assignedAgent.name } : undefined,
      updatedAt: new Date(Date.now() - (i % 72) * 3600000).toISOString(),
      // Clean fresh chat history: Zero old messages as requested!
      conversation: {
        id: `conv-in-${i}`,
        messages: [],
      }
    })
  }

  return leads
}

// Backward compatibility alias
export function generate2000Leads(agents?: GeneratedAgent[]): GeneratedLead[] {
  return generate5000IndianLeads(agents)
}
