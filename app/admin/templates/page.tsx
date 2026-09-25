import { prisma } from '@/lib/prisma'
import { TemplateManager } from '@/components/admin/TemplateManager'

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
