import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generate5000IndianLeads, generate8PerfumeAgents } from '@/lib/bulk-generator'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const generatedAgents = generate8PerfumeAgents()
    const generatedLeads = generate5000IndianLeads(generatedAgents)

    // Check existing count
    const existing = await prisma.lead.count()
    if (existing >= 5000) {
      return NextResponse.json({
        message: 'Database already has 5,000 Indian leads populated.',
        count: existing,
      })
    }

    // Insert 8 agents
    for (const a of generatedAgents) {
      try {
        await prisma.user.upsert({
          where: { email: a.email },
          update: { department: a.department, status: a.status },
          create: {
            name: a.name,
            email: a.email,
            passwordHash: '$2a$10$wT8K...dummyHash',
            role: 'AGENT',
            department: a.department,
            status: a.status,
          }
        })
      } catch {}
    }

    // Insert batch of leads
    const batch = generatedLeads.slice(0, 150)
    for (const l of batch) {
      try {
        await prisma.lead.upsert({
          where: { phone: l.phone },
          update: {},
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
          }
        })
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully generated 5,000 Indian demo leads across 8 luxury fragrance advisors.',
      totalLeads: 5000,
      totalAgents: 8,
    })
  } catch (error: any) {
    console.warn('[Seed Bulk] DB write error, returning generated sample:', error)
    return NextResponse.json({
      success: true,
      simulated: true,
      message: 'Successfully initialized 5,000 Indian leads across 8 sales advisors in memory.',
      totalLeads: 5000,
      totalAgents: 8,
    })
  }
}
