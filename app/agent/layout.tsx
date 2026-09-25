import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AgentTopBar } from '@/components/agent/AgentTopBar'
import { MobileBottomNav } from '@/components/shared/MobileBottomNav'

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <AgentTopBar user={session.user as any} />
      <main className="flex-1 min-h-0 pb-14 md:pb-0 overflow-hidden">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
