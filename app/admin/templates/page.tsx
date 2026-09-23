import { prisma } from '@/lib/prisma'
import { TemplateManager } from '@/components/admin/TemplateManager'

export const dynamic = 'force-dynamic'

const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: 'welcome_international_lead',
    body: 'Hi {{1}}, welcome to MN Brand! We received your inquiry regarding {{2}}. A dedicated regional advisor will contact you within 15 minutes.',
    category: 'MARKETING',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-2',
    name: 'order_proposal_confirmation',
    body: 'Dear {{1}}, your official business proposal #{{2}} from MN Brand is ready for review. Access your secure portal here: {{3}}',
    category: 'UTILITY',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-3',
    name: 'dormant_reengagement_24h',
    body: 'Hello {{1}}, we noticed you have been offline. Our executive team has reserved an exclusive 15% VIP incentive for {{2}} valid until this Friday.',
    category: 'MARKETING',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-4',
    name: 'strategy_call_invitation',
    body: 'Hi {{1}}, would you be available for a brief 5-minute WhatsApp audio call today with our Senior Director regarding {{2}}?',
    category: 'UTILITY',
    status: 'PENDING',
  },
  {
    id: 'tmpl-5',
    name: 'secure_auth_verification',
    body: 'Your MN Brand secure portal verification code is: {{1}}. This code expires in 10 minutes. Do not share it with anyone.',
    category: 'AUTHENTICATION',
    status: 'APPROVED',
  },
]

export default async function TemplatesPage() {
  let templates = DEFAULT_TEMPLATES

  try {
    const dbTemplates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } })
    if (dbTemplates && dbTemplates.length > 0) {
      templates = dbTemplates as any
    }
  } catch (error) {
    console.warn('[TemplatesPage] Database query failed, using safe fallback templates:', error)
  }

  return <TemplateManager initialTemplates={templates as any} />
}
