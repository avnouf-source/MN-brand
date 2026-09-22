import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AgentTopBar } from '@/components/agent/AgentTopBar'

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <AgentTopBar user={session.user as any} />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  )
}
