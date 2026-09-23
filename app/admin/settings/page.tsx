import { SettingsForm } from '@/components/admin/SettingsForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await prisma.whatsAppConfig.findFirst()
  return <SettingsForm initialConfig={config as any} />
}
