import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/agent/workspace')
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
