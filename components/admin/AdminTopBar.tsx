'use client'
import { signOut } from 'next-auth/react'
import { Bell, ChevronDown, LogOut, Shield, Menu } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

interface Props { user: { name?: string; email?: string; role?: string } }

export function AdminTopBar({ user }: Props) {
  const [open, setOpen] = useState(false)

  function handleToggleMobileMenu() {
    window.dispatchEvent(new CustomEvent('bperfume:toggle-mobile-menu'))
  }

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleToggleMobileMenu}
          className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 transition"
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <span
          style={{
            color: '#0A0F1D',
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            letterSpacing: '0.05em',
          }}
          className="text-base font-semibold"
        >
          B Perfume
        </span>
        <span className="text-slate-300 hidden sm:inline">/</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">Executive Admin</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="relative p-2 rounded-xl hover:bg-slate-50 transition">
          <Bell size={16} className="text-slate-500" />
        </button>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0F1729' }}>
              {user.name?.charAt(0) ?? 'A'}
            </div>
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
