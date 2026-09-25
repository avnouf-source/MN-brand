import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { generate8PerfumeAgents, generate5000IndianLeads } from '../lib/bulk-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding B Perfume Haute Parfumerie CRM...')

  // Delete legacy users not in the new roster
  const validEmails = [
    'admin@bperfume.com',
    'alnas@bperfume.com',
    'rashid@bperfume.com',
    'adarsh@bperfume.com',
    'fathimathshifa@bperfume.com',
    'nandana@bperfume.com',
    'nouf@bperfume.com',
    'rizvan@bperfume.com',
    'sajila@bperfume.com',
    'sajna@bperfume.com',
    'salih@bperfume.com',
  ]

  try {
    await prisma.user.deleteMany({
      where: {
        email: { notIn: validEmails },
      },
    })
    console.log('🧹 Purged obsolete user accounts.')
  } catch (err) {
    console.warn('Note on user cleanup:', err)
  }

  const superAdminHash = await bcrypt.hash('Nouf1234', 10)
  const alnasHash = await bcrypt.hash('Alnas1234', 10)
  const rashidHash = await bcrypt.hash('Rashid1234', 10)

  const agentPasswords: Record<string, string> = {
    'adarsh@bperfume.com': 'Adarsh0000',
    'fathimathshifa@bperfume.com': 'FathimathShifa0000',
    'nandana@bperfume.com': 'Nandana0000',
    'nouf@bperfume.com': 'Nouf0000',
    'rizvan@bperfume.com': 'Rizvan0000',
    'sajila@bperfume.com': 'Sajila0000',
    'sajna@bperfume.com': 'Sajna0000',
    'salih@bperfume.com': 'Salih0000',
  }

  // 1. Super Admin: Nouf
  const nouf = await prisma.user.upsert({
    where: { email: 'admin@bperfume.com' },
    update: { name: 'Nouf', passwordHash: superAdminHash, role: 'ADMIN', department: 'Executive Management' },
    create: {
      name: 'Nouf',
      email: 'admin@bperfume.com',
      passwordHash: superAdminHash,
      role: 'ADMIN',
      department: 'Executive Management',
    },
  })

  // 2. Sub-Admins (2 Users: Alnas & Rashid)
  const subAdmin1 = await prisma.user.upsert({
    where: { email: 'alnas@bperfume.com' },
    update: { name: 'Alnas', passwordHash: alnasHash, role: 'SUB_ADMIN', department: 'Fragrance Operations' },
    create: {
      name: 'Alnas',
      email: 'alnas@bperfume.com',
      passwordHash: alnasHash,
      role: 'SUB_ADMIN',
      department: 'Fragrance Operations',
    },
  })

  const subAdmin2 = await prisma.user.upsert({
    where: { email: 'rashid@bperfume.com' },
    update: { name: 'Rashid', passwordHash: rashidHash, role: 'SUB_ADMIN', department: 'VIP Client Experience' },
    create: {
      name: 'Rashid',
      email: 'rashid@bperfume.com',
      passwordHash: rashidHash,
      role: 'SUB_ADMIN',
      department: 'VIP Client Experience',
    },
  })

  // 3. Exactly 8 Sales Agents
  const rawAgents = generate8PerfumeAgents()
  const createdAgents: any[] = []

  for (const a of rawAgents) {
    const rawPw = agentPasswords[a.email] || `${a.name.replace(/\s+/g, '')}0000`
    const pwHash = await bcrypt.hash(rawPw, 10)

    const ag = await prisma.user.upsert({
      where: { email: a.email },
      update: { name: a.name, passwordHash: pwHash, department: a.department, status: a.status },
      create: {
        name: a.name,
        email: a.email,
        passwordHash: pwHash,
        role: 'AGENT',
        department: a.department,
        status: a.status,
      },
    })
    createdAgents.push(ag)
  }

  // 4. Clean purge of old messages/leads to guarantee fresh workspace
  try {
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
    await prisma.lead.deleteMany({})
    console.log('🧹 Purged legacy demo leads and chat messages.')
  } catch (err) {
    console.warn('Note on purge:', err)
  }

  // 5. Seed initial batch of 5,000 Indian leads
  const generatedLeads = generate5000IndianLeads(rawAgents)
  const initialBatch = generatedLeads.slice(0, 100)

  for (const l of initialBatch) {
    try {
      const assigned = createdAgents.find(a => a.email === l.assignedAgent?.name) || createdAgents[0]
      const lead = await prisma.lead.create({
        data: {
          name: l.name,
          phone: l.phone,
          email: l.email,
          company: l.company,
          businessRequirement: l.businessRequirement,
          country: 'IN',
          leadSource: l.leadSource,
          stage: l.stage,
          tag: l.tag,
          conversationStatus: l.conversationStatus,
          assignedAgentId: assigned?.id,
        },
      })

      // Clean conversation with 0 messages for fresh start
      await prisma.conversation.create({
        data: {
          leadId: lead.id,
          lastMessageAt: new Date(),
        },
      })
    } catch {}
  }

  // 6. Luxury Perfume Quick Replies
  const quickReplies = [
    {
      title: '🌸 Scent Discovery Consultation',
      body: 'Welcome to B Perfume Haute Parfumerie ⚜️ Would you prefer exploring our Men\'s Collection (featuring CITYMAN Extrait), Women\'s (Velvet Rose), or Unisex (Oud Royale)?',
    },
    {
      title: '🎩 CITYMAN Extrait (12-Hour)',
      body: 'CITYMAN Extrait de Parfum is our signature formulation: Italian bergamot, dark smoked cedar, and white musk with an ultra-potent 12-hour long-lasting finish. Shall we reserve a 100ml flacon for you?',
    },
    {
      title: '🌹 Velvet Rose Pour Femme',
      body: 'Velvet Rose Pour Femme is crafted with Grasse damascena rose, candied amber, and soft musk. Formulated at 30% Extrait concentration to last well over 12 hours.',
    },
    {
      title: '✨ 12-Hour Extrait Formulation',
      body: 'All B Perfume creations are crafted at Extrait de Parfum concentration (30%+ pure perfume oil), guaranteeing a persistent 12-hour sillage and exceptional projection.',
    },
    {
      title: '📦 India Express VIP Delivery',
      body: 'Your B Perfume flacon order is confirmed! Dispatched via express courier with insured packaging across Mumbai, Delhi, Bengaluru, and all metro cities within 24-48 hours.',
    },
    {
      title: '💳 Secure Payment Link',
      body: 'Here is your private order invoice for B Perfume flacons. You can complete payment via UPI, Credit Card, or Net Banking.',
    },
  ]

  for (const qr of quickReplies) {
    try {
      await prisma.quickReply.create({
        data: { title: qr.title, body: qr.body, createdBy: nouf.id },
      })
    } catch {}
  }

  // 7. WhatsApp Templates for Perfume Brand
  const templates = [
    {
      name: 'bperfume_welcome_consultation',
      body: 'Dear {{1}}, welcome to B Perfume Haute Parfumerie. Our luxury scent stylist {{2}} has been assigned to curate your fragrance profile.',
      status: 'APPROVED',
      category: 'MARKETING',
    },
    {
      name: 'bperfume_order_dispatched',
      body: 'Greetings {{1}}! Your B Perfume flacon order for {{2}} has been dispatched. Courier tracking: {{3}}.',
      status: 'APPROVED',
      category: 'UTILITY',
    },
    {
      name: 'bperfume_cityman_vip_offer',
      body: 'Hello {{1}}, explore CITYMAN Extrait de Parfum — our iconic 12-hour long-lasting creation. Exclusive VIP invitation enclosed.',
      status: 'APPROVED',
      category: 'MARKETING',
    },
  ]

  for (const t of templates) {
    try {
      await prisma.template.create({ data: t })
    } catch {}
  }

  console.log('✅ B Perfume seed completed successfully!')
  console.log('👑 Super Admin:  admin@bperfume.com / Nouf1234 (Nouf)')
  console.log('🛡️ Sub-Admin 1:  alnas@bperfume.com / Alnas1234 (Alnas)')
  console.log('🛡️ Sub-Admin 2:  rashid@bperfume.com / Rashid1234 (Rashid)')
  console.log('👤 Sales Agents: 8 Accounts (Adarsh0000, FathimathShifa0000, Nandana0000, Nouf0000, Rizvan0000, Sajila0000, Sajna0000, Salih0000)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
