'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, Users, Bot, FileText, Settings, MessageCircle, ClipboardList, ShieldCheck } from 'lucide-react'
import { BPerfumeLogo } from '@/components/shared/BPerfumeLogo'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/ai-assistant', icon: Sparkles, label: 'Executive AI' },
  { href: '/admin/team', icon: Users, label: 'Team' },
  { href: '/admin/automation', icon: Bot, label: 'Automation' },
  { href: '/admin/templates', icon: FileText, label: 'Templates' },
  { href: '/admin/logs', icon: ClipboardList, label: 'Activity Logs' },
  { href: '/admin/security', icon: ShieldCheck, label: 'Security & GDPR' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminSidebar() {
  const path = usePathname()
  return (
    <div className="w-60 flex-shrink-0 flex flex-col h-full" style={{ background: '#0A0F1D' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <BPerfumeLogo size="sm" variant="dark" />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white tracking-wider font-serif">B PERFUME</span>
            </div>
            <p className="text-[8px] font-semibold tracking-widest uppercase text-amber-300/80">Haute Parfumerie</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = path.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
              style={{
                background: active ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: active ? '#C9A84C' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Agent view link */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <Link
          href="/agent/workspace"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}
        >
          <MessageCircle size={14} />
          Switch to Agent View
        </Link>
      </div>
    </div>
  )
}
