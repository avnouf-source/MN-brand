'use client'
import { useMemo } from 'react'
import { MessageCircle, Clock, Bell, CheckCircle2, Users, TrendingUp, Activity } from 'lucide-react'
import type { Lead } from './AgentWorkspace'

interface Props {
  leads: Lead[]
  active: string
  onChange: (f: string) => void
}

const TABS = [
  { key: 'ALL',     label: 'All Chats',  icon: Users,         color: '#334155', bg: '#f1f5f9', activeBg: '#0F1729' },
  { key: 'OPEN',    label: 'Open',       icon: MessageCircle, color: '#10b981', bg: '#ecfdf5', activeBg: '#10b981' },
  { key: 'UNREAD',  label: 'Unread',     icon: Bell,          color: '#ef4444', bg: '#fef2f2', activeBg: '#ef4444' },
  { key: 'WAITING', label: 'Waiting',    icon: Clock,         color: '#C9A84C', bg: '#FDF6E3', activeBg: '#C9A84C' },
  { key: 'CLOSED',  label: 'Closed',     icon: CheckCircle2,  color: '#64748b', bg: '#f8fafc', activeBg: '#64748b' },
]

export function getConvStatus(lead: Lead): string {
  if (lead.conversationStatus && lead.conversationStatus !== 'OPEN') return lead.conversationStatus
  const msgs = lead.conversation?.messages ?? []
  if (msgs.length === 0) return 'OPEN'
  const hasUnread = msgs.some(m => !m.isRead && m.direction === 'INBOUND')
  if (hasUnread) return 'UNREAD'
  const last = msgs[msgs.length - 1]
  if (last.direction === 'OUTBOUND') return 'WAITING'
  if (lead.stage === 'DONE') return 'CLOSED'
  return lead.conversationStatus ?? 'OPEN'
}

export function PipelineDashboard({ leads, active, onChange }: Props) {
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: leads.length, OPEN: 0, UNREAD: 0, WAITING: 0, CLOSED: 0 }
    leads.forEach(l => { const s = getConvStatus(l); if (c[s] !== undefined) c[s]++ })
    return c
  }, [leads])

  const hot = leads.filter(l => l.tag === 'HOT').length
  const orders = leads.filter(l => l.stage === 'ORDER_PLACED').length

  return (
    <div className="bg-white border-b border-slate-100 flex-shrink-0">
      {/* KPI strip */}
      <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3" style={{ background: '#FDF6E3' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={11} style={{ color: '#C9A84C' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#C9A84C' }}>Hot Leads</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>{hot}</p>
        </div>
        <div className="bg-violet-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={11} className="text-violet-500" />
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">Orders</span>
          </div>
          <p className="text-2xl font-bold text-violet-600">{orders}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: '#f0f4f8' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={11} style={{ color: '#0F1729' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#0F1729' }}>Total</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#0F1729' }}>{leads.length}</p>
        </div>
      </div>

      {/* Pipeline tabs */}
      <div className="px-3 pb-3 pt-1 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = counts[tab.key] ?? 0
          const on = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-shrink-0 border"
              style={{
                background: on ? tab.activeBg : '#fff',
                color: on ? '#fff' : tab.color,
                borderColor: on ? 'transparent' : '#e2e8f0',
              }}
            >
              <Icon size={13} />
              {tab.label}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: on ? 'rgba(255,255,255,0.2)' : tab.bg, color: on ? '#fff' : tab.color }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
