'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Bot,
  FileText,
  Settings,
  MessageCircle,
  ClipboardList,
  ShieldCheck,
  Package,
  X,
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/catalog', icon: Package, label: 'Product Catalog' },
  { href: '/admin/ai-assistant', icon: Sparkles, label: 'Executive AI' },
  { href: '/admin/team', icon: Users, label: 'Team Hierarchy' },
  { href: '/admin/automation', icon: Bot, label: 'Automation & Refills' },
  { href: '/admin/templates', icon: FileText, label: 'Templates' },
  { href: '/training-hub', icon: Sparkles, label: 'Training Sandbox' },
  { href: '/admin/logs', icon: ClipboardList, label: 'Activity Logs' },
  { href: '/admin/security', icon: ShieldCheck, label: 'Security & GDPR' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminSidebar() {
  const rawPath = usePathname()
  const path = rawPath || ''
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleToggle() {
      setMobileOpen(prev => !prev)
    }
    window.addEventListener('bperfume:toggle-mobile-menu', handleToggle)
    return () => window.removeEventListener('bperfume:toggle-mobile-menu', handleToggle)
  }, [])

  // Auto-close mobile drawer when navigating
  useEffect(() => {
    setMobileOpen(false)
  }, [path])

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: '#0A0F1D' }}>
      {/* Brand Name Typography */}
      <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div>
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
            className="text-lg font-semibold text-white tracking-wider"
          >
            B Perfume
          </h2>
          <p className="text-[9px] font-semibold tracking-widest uppercase text-amber-300/80 mt-0.5">
            Haute Parfumerie
          </p>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = path.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
              style={{
                background: active ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: active ? '#C9A84C' : 'rgba(255,255,255,0.6)',
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Switch to Agent view link */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <Link
          href="/agent/workspace"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition"
          style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.04)' }}
        >
          <MessageCircle size={14} style={{ color: '#C9A84C' }} />
          Switch to Agent View
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col h-full border-r border-slate-900/10">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
