import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: 'welcome_perfume_lead',
    body: 'Hi {{1}}, welcome to B Perfume Haute Parfumerie! 🌸 We received your interest in our 12-hour Extrait collection ({{2}}). Your personal fragrance advisor will assist you momentarily.',
    category: 'MARKETING',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-2',
    name: 'perfume_order_confirmation',
    body: 'Dear {{1}}, your B Perfume luxury order #{{2}} has been confirmed. Your flacons are being hand-packaged at our boutique. Track your delivery here: {{3}}',
    category: 'UTILITY',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-3',
    name: 'exclusive_vip_fragrance_offer',
    body: 'Hello {{1}}, an exclusive 15% VIP invitation awaits you on our flagship CITYMAN Extrait and Oud Royale flacons valid until this Sunday with code: ROYAL15 👑',
    category: 'MARKETING',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-4',
    name: 'fragrance_consultation_invitation',
    body: 'Hi {{1}}, would you like a complimentary 5-minute perfume consultation call today with our Senior Fragrance Sommelier regarding {{2}}?',
    category: 'UTILITY',
    status: 'PENDING',
  },
  {
    id: 'tmpl-5',
    name: 'bperfume_auth_verification',
    body: 'Your B Perfume VIP Portal verification code is: {{1}}. This code expires in 10 minutes. Please keep it confidential.',
    category: 'AUTHENTICATION',
    status: 'APPROVED',
  },
]

export async function GET() {
  try {
    const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } })
    if (templates && templates.length > 0) {
      return NextResponse.json(templates)
    }
  } catch (err) {
    console.warn('[GET /api/templates] DB query failed, using fallback templates:', err)
  }
  return NextResponse.json(DEFAULT_TEMPLATES)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { name, body, category } = await req.json()

  try {
    const template = await prisma.template.create({
      data: { name, body, category: category ?? 'MARKETING' }
    })
    return NextResponse.json(template)
  } catch (err) {
    console.warn('[POST /api/templates] DB create failed, returning optimistic object:', err)
    return NextResponse.json({
      id: `tmpl-user-${Date.now()}`,
      name,
      body,
      category: category ?? 'MARKETING',
      status: 'PENDING',
    })
  }
}
