import { SettingsForm } from '@/components/admin/SettingsForm'
import { prisma } from '@/lib/prisma'
export default async function SettingsPage() {
  const config = await prisma.whatsAppConfig.findFirst()
  return <SettingsForm initialConfig={config as any} />
}
