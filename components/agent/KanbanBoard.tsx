'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { formatPhoneDisplay, parsePhone } from '@/lib/countries'
import type { Lead } from './AgentWorkspace'

interface Props {
  leads: Lead[]
  filter: string
  onFilterChange: (f: string) => void
  onSelect: (lead: Lead) => void
  selectedId?: string
  onUpdate: (lead: Lead) => void
}

const STAGES = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'TALKING', label: 'Active' },
  { key: 'DONE', label: 'Done' },
]

const STAGE_DOT: Record<string, string> = {
  NEW: '#3b82f6',
  TALKING: '#C9A84C',
  ORDER_PLACED: '#8b5cf6',
  DONE: '#10b981',
}

const TAG_DOT: Record<string, string> = {
  HOT: '#ef4444',
  WARM: '#f59e0b',
  COLD: '#3b82f6',
  NONE: 'transparent',
}

export function KanbanBoard({ leads, filter, onFilterChange, onSelect, selectedId, onUpdate }: Props) {
  const [search, setSearch] = useState('')

  const filtered = leads.filter(l => {
    if (filter !== 'ALL' && l.stage !== filter && !(filter === 'TALKING' && l.stage === 'ORDER_PLACED')) return false
    if (search) {
      const q = search.toLowerCase()
      if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q) && !(l.company ?? '').toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search */}
      <div className="px-3 py-2.5 flex-shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 placeholder-slate-400"
            style={{ '--tw-ring-color': '#C9A84C' } as any}
          />
        </div>
      </div>

      {/* Stage chips */}
      <div className="px-3 pb-2 flex gap-1.5 flex-shrink-0">
        {STAGES.map(s => (
          <button
            key={s.key}
            onClick={() => onFilterChange(s.key)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition border"
            style={{
              background: filter === s.key ? '#0F1729' : '#fff',
              color: filter === s.key ? '#fff' : '#64748b',
              borderColor: filter === s.key ? '#0F1729' : '#e2e8f0',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Lead list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(lead => {
          const { country } = parsePhone(lead.phone)
          const msgs = lead.conversation?.messages ?? []
          const lastMsg = msgs[msgs.length - 1]
          const unread = msgs.filter(m => !m.isRead && m.direction === 'INBOUND').length
          const selected = selectedId === lead.id

          return (
            <button
              key={lead.id}
              onClick={() => onSelect(lead)}
              className="w-full text-left px-3 py-3 border-b border-slate-50 transition"
              style={{ background: selected ? '#FDF6E3' : 'transparent' }}
            >
              <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 relative"
                  style={{ background: '#0F1729' }}>
                  {lead.name.charAt(0)}
                  {lead.tag !== 'NONE' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: TAG_DOT[lead.tag] }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Row 1: Name + time */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">{lead.name}</span>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Phone with flag */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {country && <span className="text-xs leading-none">{country.flag}</span>}
                    <span className="text-[11px] text-slate-400 font-mono">{formatPhoneDisplay(lead.phone)}</span>
                  </div>

                  {/* Row 3: Company + last message preview */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-slate-500 truncate">
                      {lead.company && <span className="font-medium text-slate-600">{lead.company} · </span>}
                      {lastMsg?.body ?? 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Stage dot */}
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_DOT[lead.stage] ?? '#94a3b8' }} />
                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: '#ef4444' }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No leads found</p>
          </div>
        )}
      </div>
    </div>
  )
}
