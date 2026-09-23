import { prisma } from '@/lib/prisma'
import { TemplateManager } from '@/components/admin/TemplateManager'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } })
  return <TemplateManager initialTemplates={templates as any} />
}
