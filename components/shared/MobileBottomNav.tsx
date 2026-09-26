'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Users,
  Menu,
  CheckSquare,
  PhoneCall,
  Sparkles,
} from 'lucide-react'

export function MobileBottomNav() {
  const rawPathname = usePathname()
  const pathname = rawPathname || ''
  const isAdmin = pathname.startsWith('/admin')
  const [activeAgentTab, setActiveAgentTab] = useState<'chats' | 'leads'>('chats')

  function handleOpenDrawer() {
    window.dispatchEvent(new CustomEvent('bperfume:toggle-mobile-menu'))
  }

  function handleOpenDialer() {
    window.dispatchEvent(new CustomEvent('mn:open-global-dialer'))
  }

  function handleSwitchAgentTab(tab: 'chats' | 'leads' | 'tasks') {
    if (tab === 'chats' || tab === 'leads') {
      setActiveAgentTab(tab)
    }
    window.dispatchEvent(new CustomEvent('bperfume:agent-tab', { detail: { tab } }))
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 mobile-bottom-nav backdrop-blur-lg border-t"
      style={{
        background: 'rgba(10, 15, 29, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {isAdmin ? (
          <>
            {/* Admin Tab 1: Dashboard */}
            <Link
              href="/admin/dashboard"
              className="flex flex-col items-center justify-center flex-1 py-1 transition"
              style={{
                color: pathname === '/admin/dashboard' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <LayoutDashboard size={18} />
              <span className="text-[10px] font-medium mt-1">Analytics</span>
            </Link>

            {/* Admin Tab 2: Catalog */}
            <Link
              href="/admin/catalog"
              className="flex flex-col items-center justify-center flex-1 py-1 transition"
              style={{
                color: pathname === '/admin/catalog' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <Package size={18} />
              <span className="text-[10px] font-medium mt-1">Catalog</span>
            </Link>

            {/* Admin Tab 3: Chats / Agent Workspace */}
            <Link
              href="/agent/workspace"
              className="flex flex-col items-center justify-center flex-1 py-1 transition"
              style={{
                color: pathname.startsWith('/agent') ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <MessageCircle size={18} />
              <span className="text-[10px] font-medium mt-1">Chats</span>
            </Link>

            {/* Admin Tab 4: Team */}
            <Link
              href="/admin/team"
              className="flex flex-col items-center justify-center flex-1 py-1 transition"
              style={{
                color: pathname === '/admin/team' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <Users size={18} />
              <span className="text-[10px] font-medium mt-1">Advisors</span>
            </Link>

            {/* Admin Tab 5: Slide Drawer Menu */}
            <button
              type="button"
              onClick={handleOpenDrawer}
              className="flex flex-col items-center justify-center flex-1 py-1 transition text-white/50 active:text-white"
            >
              <Menu size={18} />
              <span className="text-[10px] font-medium mt-1">Menu</span>
            </button>
          </>
        ) : (
          <>
            {/* Agent Tab 1: Native Chats (Strict 3-element pure chat view) */}
            <button
              type="button"
              onClick={() => handleSwitchAgentTab('chats')}
              className="flex flex-col items-center justify-center flex-1 py-1 transition"
              style={{ color: activeAgentTab === 'chats' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)' }}
            >
              <MessageCircle size={18} />
              <span className="text-[10px] font-medium mt-1">Chats</span>
            </button>

            {/* Agent Tab 2: Catalog */}
            <Link
              href="/admin/catalog"
              className="flex flex-col items-center justify-center flex-1 py-1 transition text-white/50 active:text-white"
            >
              <Package size={18} />
              <span className="text-[10px] font-medium mt-1">Catalog</span>
            </Link>

            {/* Agent Tab 3: Global Dialer */}
            <button
              type="button"
              onClick={handleOpenDialer}
              className="flex flex-col items-center justify-center flex-1 py-1 transition text-white/50 active:text-white"
            >
              <PhoneCall size={18} />
              <span className="text-[10px] font-medium mt-1">Dialer</span>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
