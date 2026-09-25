'use client'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Bell, ChevronDown, LogOut, Shield, Globe, PhoneCall } from 'lucide-react'
import Link from 'next/link'
import { GlobalDialerModal } from '@/components/agent/GlobalDialerModal'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

interface Props { user: { name?: string; email?: string; role?: string } }

export function AgentTopBar({ user }: Props) {
  const [open, setOpen] = useState(false)
  const [online, setOnline] = useState(false)
  const [dialerOpen, setDialerOpen] = useState(false)

  async function toggleStatus() {
    const next = !online
    setOnline(next)
    await fetch('/api/agents/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next ? 'ONLINE' : 'OFFLINE' }),
    })
  }

  useEffect(() => {
    function handleOpenDialer() {
      setDialerOpen(true)
    }
    window.addEventListener('mn:open-global-dialer', handleOpenDialer)
    return () => window.removeEventListener('mn:open-global-dialer', handleOpenDialer)
  }, [])

  function handleSaveAsLeadFromDialer(phoneNumber: string) {
    // Dispatch a window custom event to open lead modal with prefilled phone
    window.dispatchEvent(new CustomEvent('mn:open-lead-modal', { detail: { phone: phoneNumber } }))
  }

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
        {/* Clean Typography Brand Name */}
        <div className="flex items-center">
          <span
            style={{
              color: '#0A0F1D',
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              letterSpacing: '0.08em',
            }}
            className="text-base font-semibold tracking-wider"
          >
            B Perfume
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct International Calling / Global Dialer Button */}
          <button
            onClick={() => setDialerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95"
            style={{ background: '#0F1729' }}
            title="Open Global Dialer"
          >
            <PhoneCall size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">Global Dialer</span>
          </button>

          {/* Online/Offline Toggle */}
          <button
            onClick={toggleStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition"
            style={{
              background: online ? '#f0fdf4' : '#fafafa',
              color: online ? '#10b981' : '#94a3b8',
              borderColor: online ? '#bbf7d0' : '#e2e8f0',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: online ? '#10b981' : '#94a3b8' }} />
            <span className="hidden xs:inline">{online ? 'Online' : 'Offline'}</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Notification bell */}
          <button className="p-2 rounded-xl hover:bg-slate-50 transition text-slate-500">
            <Bell size={16} />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0F1729' }}>
                {user.name?.charAt(0) ?? 'A'}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">{user.name}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#FDF6E3', color: '#C9A84C' }}>
                    <Globe size={9} /> {user.role}
                  </span>
                </div>
                {user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                    <Shield size={13} /> Admin Panel
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Dialer Modal */}
      <GlobalDialerModal
        isOpen={dialerOpen}
        onClose={() => setDialerOpen(false)}
        onSaveAsLead={handleSaveAsLeadFromDialer}
      />
    </>
  )
}
