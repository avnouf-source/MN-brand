import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ActivityLogs } from '@/components/admin/ActivityLogs'

export const dynamic = 'force-dynamic'

export default async function ActivityLogsPage() {
  const session = await getServerSession(authOptions)
  const isSuperAdmin =
    session?.user &&
    ((session.user as any).role === 'ADMIN' ||
      (session.user as any).email === 'admin@bperfume.com')

  if (!isSuperAdmin) {
    redirect('/agent/workspace')
  }

  return <ActivityLogs />
}
