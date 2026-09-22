import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MN Brand CRM...')

  const adminHash = await bcrypt.hash('admin123', 10)
  const agentHash = await bcrypt.hash('agent123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mnbrand.com' },
    update: {},
    create: { name: 'MN Admin', email: 'admin@mnbrand.com', passwordHash: adminHash, role: 'ADMIN', department: 'Management' },
  })

  const sara = await prisma.user.upsert({
    where: { email: 'sara@mnbrand.com' },
    update: {},
    create: { name: 'Sara Johnson', email: 'sara@mnbrand.com', passwordHash: agentHash, role: 'AGENT', department: 'Sales' },
  })

  const karim = await prisma.user.upsert({
    where: { email: 'karim@mnbrand.com' },
    update: {},
    create: { name: 'Karim Al-Hassan', email: 'karim@mnbrand.com', passwordHash: agentHash, role: 'AGENT', department: 'Business Dev' },
  })

  const leadsData = [
    { name: 'James Mitchell', phone: '+447911123456', tag: 'HOT', stage: 'TALKING', status: 'OPEN', agent: sara.id, company: 'Mitchell & Co', req: 'Lead generation for UK property market', source: 'LinkedIn', country: 'GB' },
    { name: 'Aisha Al-Farsi', phone: '+971501234567', tag: 'HOT', stage: 'ORDER_PLACED', status: 'WAITING', agent: sara.id, company: 'Al-Farsi Investments', req: 'CRM system for Dubai real estate', source: 'Instagram', country: 'AE' },
    { name: 'Carlos Mendez', phone: '+5511987654321', tag: 'WARM', stage: 'TALKING', status: 'UNREAD', agent: karim.id, company: 'Mendez Group', req: 'B2B lead generation Brazil', source: 'WhatsApp', country: 'BR' },
    { name: 'Sophie Laurent', phone: '+33612345678', tag: 'WARM', stage: 'NEW', status: 'OPEN', agent: karim.id, company: 'Laurent Conseil', req: 'Marketing automation for French SMEs', source: 'Referral', country: 'FR' },
    { name: 'Raj Patel', phone: '+919876543210', tag: 'COLD', stage: 'NEW', status: 'OPEN', agent: sara.id, company: 'Patel Tech', req: 'Sales funnel optimization', source: 'Website', country: 'IN' },
    { name: 'Emma Schulz', phone: '+491701234567', tag: 'HOT', stage: 'DONE', status: 'CLOSED', agent: karim.id, company: 'Schulz GmbH', req: 'Enterprise CRM integration', source: 'LinkedIn', country: 'DE' },
  ]

  for (const l of leadsData) {
    let lead
    try {
      lead = await prisma.lead.create({
        data: {
          name: l.name, phone: l.phone, tag: l.tag, stage: l.stage,
          conversationStatus: l.status, assignedAgentId: l.agent,
          company: l.company, businessRequirement: l.req, leadSource: l.source, country: l.country,
        }
      })
    } catch { continue }

    const conv = await prisma.conversation.create({ data: { leadId: lead.id, lastMessageAt: new Date() } })
    const msgs = [
      { body: `Hi, I'm interested in your services. ${l.req}`, direction: 'INBOUND', type: 'TEXT', senderType: 'customer' },
      { body: `Hello ${l.name}! Thank you for reaching out to MN Brand. We'd love to discuss how we can help ${l.company}. Could you tell me more about your requirements?`, direction: 'OUTBOUND', type: 'TEXT', senderType: 'agent', senderId: l.agent },
      { body: `We specialize in ${l.req}. Our team is available for a discovery call this week.`, direction: 'INBOUND', type: 'TEXT', senderType: 'customer' },
    ]
    for (const m of msgs) {
      try { await prisma.message.create({ data: { conversationId: conv.id, ...m as any } }) } catch {}
    }
  }

  const quickReplies = [
    { title: 'Welcome', body: 'Welcome to MN Brand! 👋 We are a global lead generation company. How can we help your business grow today?' },
    { title: 'Discovery Call', body: 'Thank you for your interest! Let\'s schedule a discovery call to understand your needs better. What time works best for you this week?' },
    { title: 'Service Overview', body: 'MN Brand offers:\n✅ Global Lead Generation\n✅ WhatsApp CRM Solutions\n✅ International Marketing\n✅ Business Development\n\nWhich area are you most interested in?' },
    { title: 'Follow Up', body: 'I\'m following up on our previous conversation. Have you had a chance to review our proposal? I\'m happy to answer any questions.' },
    { title: 'Proposal Ready', body: 'Great news! Your customized proposal is ready. I\'ll send it over shortly. Please review and let me know your thoughts.' },
    { title: 'Thank You', body: 'Thank you for choosing MN Brand! 🌟 We\'re excited to work with you. Our team will be in touch within 24 hours to get started.' },
  ]
  for (const qr of quickReplies) {
    try { await prisma.quickReply.create({ data: { ...qr, createdBy: admin.id } }) } catch {}
  }

  const templates = [
    { name: 'welcome_mnbrand', body: 'Hi {{1}}! Welcome to MN Brand. We help businesses like {{2}} grow globally. Reply to learn more about our services.', status: 'APPROVED', category: 'MARKETING' },
    { name: 'follow_up', body: 'Hi {{1}}, this is {{2}} from MN Brand. Following up on your interest in our lead generation services. Are you available for a quick call?', status: 'APPROVED', category: 'UTILITY' },
    { name: 'proposal_sent', body: 'Hi {{1}}, your personalized proposal from MN Brand has been sent to {{2}}. Please review and let us know your feedback.', status: 'PENDING', category: 'UTILITY' },
  ]
  for (const t of templates) {
    try { await prisma.template.create({ data: t }) } catch {}
  }

  console.log('✅ Seed complete!')
  console.log('👑 Admin:  admin@mnbrand.com / admin123')
  console.log('👤 Agent:  sara@mnbrand.com  / agent123')
  console.log('👤 Agent:  karim@mnbrand.com / agent123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
