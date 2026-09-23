import { SettingsForm } from '@/components/admin/SettingsForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_CONFIG = {
  id: 'main',
  phoneNumberId: '',
  accessToken: '',
  webhookVerifyToken: 'mnbrand-webhook-verify-2024',
  businessAccountId: '',
}

export default async function SettingsPage() {
  let config = DEFAULT_CONFIG

  try {
    const dbConfig = await prisma.whatsAppConfig.findFirst()
    if (dbConfig) {
      config = dbConfig
    }
  } catch (error) {
    console.warn('[SettingsPage] Database query failed, using safe fallback config:', error)
  }

  return <SettingsForm initialConfig={config as any} />
}
