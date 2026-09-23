import { PrismaClient } from '@prisma/client'
import { generate2000Leads, generate50Agents } from '../lib/bulk-generator'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting bulk generation for 50 agents and 2,000+ leads...')

  const passwordHash = await bcrypt.hash('agent123', 10)
  const adminPasswordHash = await bcrypt.hash('admin123', 10)

  // 1. Ensure Admin exists
  await prisma.user.upsert({
    where: { email: 'admin@mnbrand.com' },
    update: {},
    create: {
      name: 'MN Admin',
      email: 'admin@mnbrand.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ONLINE',
      department: 'Executive',
    },
  })

  // 2. Generate 50 Agents
  const agents = generate50Agents()
  console.log(`👤 Seeding ${agents.length} international agents...`)
  const createdAgents: any[] = []

  for (const a of agents) {
    try {
      const u = await prisma.user.upsert({
        where: { email: a.email },
        update: { department: a.department, status: a.status },
        create: {
          name: a.name,
          email: a.email,
          passwordHash,
          role: 'AGENT',
          department: a.department,
          status: a.status,
        },
      })
      createdAgents.push(u)
    } catch (e) {
      console.warn(`Could not seed agent ${a.email}:`, e)
    }
  }

  // 3. Generate 2,000 Leads distributed across the 50 agents
  console.log('📋 Generating 2,000 leads with equal distribution (~40 leads/agent)...')
  const leads = generate2000Leads(createdAgents)

  let count = 0
  const BATCH_SIZE = 100

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async l => {
        try {
          const leadRecord = await prisma.lead.upsert({
            where: { phone: l.phone },
            update: {
              assignedAgentId: l.assignedAgentId,
              stage: l.stage,
              tag: l.tag,
              conversationStatus: l.conversationStatus,
            },
            create: {
              name: l.name,
              phone: l.phone,
              email: l.email,
              company: l.company,
              businessRequirement: l.businessRequirement,
              leadSource: l.leadSource,
              stage: l.stage,
              tag: l.tag,
              conversationStatus: l.conversationStatus,
              assignedAgentId: l.assignedAgentId,
            },
          })

          // Ensure conversation exists
          const conv = await prisma.conversation.upsert({
            where: { leadId: leadRecord.id },
            update: {},
            create: { leadId: leadRecord.id },
          })

          // Create first message
          if (l.conversation?.messages?.[0]) {
            await prisma.message.create({
              data: {
                conversationId: conv.id,
                body: l.conversation.messages[0].body,
                direction: 'INBOUND',
                type: 'TEXT',
                senderType: 'customer',
              }
            }).catch(() => {})
          }
        } catch {}
      })
    )
    count += batch.length
    if (count % 500 === 0 || count === leads.length) {
      console.log(`   ✓ Seeded ${count} / ${leads.length} leads...`)
    }
  }

  console.log(`🎉 Complete! Database now populated with 50 agents and ${count} leads equally distributed.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
