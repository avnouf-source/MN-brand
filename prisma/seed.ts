import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { generate8PerfumeAgents, generate5000IndianLeads } from '../lib/bulk-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding B Perfume Haute Parfumerie CRM...')

  const superAdminHash = await bcrypt.hash('nouf123', 10)
  const subAdminHash = await bcrypt.hash('subadmin123', 10)
  const agentHash = await bcrypt.hash('agent123', 10)

  // 1. Super Admin: Nouf
  const nouf = await prisma.user.upsert({
    where: { email: 'nouf@bperfume.com' },
    update: { name: 'Nouf (Super Admin)', role: 'ADMIN', department: 'Executive Management' },
    create: {
      name: 'Nouf (Super Admin)',
      email: 'nouf@bperfume.com',
      passwordHash: superAdminHash,
      role: 'ADMIN',
      department: 'Executive Management',
    },
  })

  // Super Admin Alias
  await prisma.user.upsert({
    where: { email: 'admin@bperfume.com' },
    update: { name: 'Nouf (Super Admin)', role: 'ADMIN' },
    create: {
      name: 'Nouf (Super Admin)',
      email: 'admin@bperfume.com',
      passwordHash: superAdminHash,
      role: 'ADMIN',
      department: 'Executive Management',
    },
  })

  // 2. Sub-Admins (2)
  const subAdmin1 = await prisma.user.upsert({
    where: { email: 'subadmin1@bperfume.com' },
    update: { role: 'SUB_ADMIN', department: 'Fragrance Operations' },
    create: {
      name: 'Tariq Al-Mansoor',
      email: 'subadmin1@bperfume.com',
      passwordHash: subAdminHash,
      role: 'SUB_ADMIN',
      department: 'Fragrance Operations',
    },
  })

  const subAdmin2 = await prisma.user.upsert({
    where: { email: 'subadmin2@bperfume.com' },
    update: { role: 'SUB_ADMIN', department: 'VIP Client Experience' },
    create: {
      name: 'Reem Al-Kuwari',
      email: 'subadmin2@bperfume.com',
      passwordHash: subAdminHash,
      role: 'SUB_ADMIN',
      department: 'VIP Client Experience',
    },
  })

  // 3. Exactly 8 Sales Agents
  const rawAgents = generate8PerfumeAgents()
  const createdAgents: any[] = []

  for (const a of rawAgents) {
    const ag = await prisma.user.upsert({
      where: { email: a.email },
      update: { name: a.name, department: a.department, status: a.status },
      create: {
        name: a.name,
        email: a.email,
        passwordHash: agentHash,
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
  console.log('👑 Super Admin:  nouf@bperfume.com / nouf123')
  console.log('🛡️ Sub-Admin 1:  subadmin1@bperfume.com / subadmin123')
  console.log('🛡️ Sub-Admin 2:  subadmin2@bperfume.com / subadmin123')
  console.log('👤 Sales Agents: sara@bperfume.com to vikram@bperfume.com / agent123 (8 agents)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
