'use client'
import { signOut } from 'next-auth/react'
import { Bell, ChevronDown, LogOut, Shield } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

interface Props { user: { name?: string; email?: string; role?: string } }

export function AdminTopBar({ user }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <Shield size={14} style={{ color: '#C9A84C' }} />
        <span className="text-sm font-semibold text-slate-700">Admin Panel</span>
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
