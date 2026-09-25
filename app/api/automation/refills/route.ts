import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const reminders = await prisma.refillReminder.findMany({
      orderBy: { dueDate: 'asc' },
    })
    return NextResponse.json(reminders)
  } catch (error: any) {
    console.warn('[Refills API] Error fetching refill reminders:', error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      leadId,
      customerName,
      customerPhone,
      productName,
      productCode,
      bottleSize = '100ml',
      orderDate = new Date(),
    } = body

    const ordDate = new Date(orderDate)
    const dueDate = new Date(ordDate.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days

    const defaultMsg = `Greetings ${customerName}, running low on your ${productName} Extrait (${bottleSize})? Your 60-day luxury replenishment window is open with complimentary VIP delivery. Re-order here: https://bperfume.com/refill/${productCode || 'vip'}`

    const reminder = await prisma.refillReminder.create({
      data: {
        leadId: leadId || `lead-${Date.now()}`,
        customerName: customerName || 'VIP Client',
        customerPhone: customerPhone || '+91',
        productName: productName || 'Extrait de Parfum',
        productCode,
        bottleSize,
        orderDate: ordDate,
        dueDate,
        status: 'SCHEDULED',
        scheduledMessage: defaultMsg,
      },
    })

    return NextResponse.json({ success: true, reminder }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to schedule refill reminder' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const updated = await prisma.refillReminder.update({
      where: { id },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : undefined,
      },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update reminder' }, { status: 500 })
  }
}
