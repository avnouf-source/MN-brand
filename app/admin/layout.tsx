import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { MobileBottomNav } from '@/components/shared/MobileBottomNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as any)?.role
  if (role !== 'ADMIN' && role !== 'SUB_ADMIN') redirect('/agent/workspace')
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 md:pb-6">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  )
}
