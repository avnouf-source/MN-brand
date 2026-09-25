'use client'
import React, { useState, useMemo, useRef, memo } from 'react'
import { Search, Phone } from 'lucide-react'
import { formatPhoneDisplay, parsePhone, telLink, getCountryLocalTime } from '@/lib/countries'
import { calculatePredictiveScore } from '@/lib/ai-scoring'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebounce } from '@/lib/hooks/useDebounce'
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
  { key: 'ALL', label: 'All Inquiries' },
  { key: 'NEW_INQUIRY', label: 'New' },
  { key: 'SCENT_RECOMMENDATION', label: 'Consulting' },
  { key: 'ORDER_PLACED', label: 'Orders' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
]

const STAGE_DOT: Record<string, string> = {
  NEW_INQUIRY: '#3b82f6',
  NEW: '#3b82f6',
  SCENT_RECOMMENDATION: '#C9A84C',
  TALKING: '#C9A84C',
  ORDER_PLACED: '#8b5cf6',
  SHIPPED: '#059669',
  DELIVERED: '#10b981',
  DONE: '#10b981',
}

const TAG_DOT: Record<string, string> = {
  HOT: '#ef4444',
  WARM: '#f59e0b',
  COLD: '#3b82f6',
  NONE: 'transparent',
}

interface LeadRowProps {
  lead: Lead
  isSelected: boolean
  onSelect: (lead: Lead) => void
}

const LeadRow = memo(function LeadRow({ lead, isSelected, onSelect }: LeadRowProps) {
  const msgs = lead.conversation?.messages ?? []
  const lastMsg = msgs[msgs.length - 1]
  const unread = msgs.filter(m => !m.isRead && m.direction === 'INBOUND').length
  const { country } = parsePhone(lead.phone)
  const localTime = getCountryLocalTime(country?.code || null)
  const score = calculatePredictiveScore(lead)

  return (
    <div
      className="w-full flex items-center justify-between px-3 py-3 transition group border-b border-slate-50"
      style={{ background: isSelected ? '#FDF6E3' : 'transparent' }}
    >
      {/* Clickable Lead Card Area */}
      <button
        type="button"
        onClick={() => onSelect(lead)}
        className="flex-1 flex items-start gap-2.5 text-left min-w-0 cursor-pointer"
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 relative shadow-xs"
          style={{ background: '#0F1729' }}
        >
          {lead.name.charAt(0)}
          {lead.tag !== 'NONE' && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: TAG_DOT[lead.tag] }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          {/* Row 1: Name + score + time */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-semibold text-slate-800 truncate">{lead.name}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: score.bg, color: score.color }}
                title={`AI Intent: ${score.label} (${score.score}/100)`}
              >
                🎯 {score.score}%
              </span>
              {lastMsg && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Phone with flag + Local Time & Sleep Indicator */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {country && <span className="text-xs leading-none">{country.flag}</span>}
            <span className="text-[11px] text-slate-500 font-mono">{formatPhoneDisplay(lead.phone)}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: localTime.bg, color: localTime.color }}
              title={`${localTime.timezoneName} · ${localTime.status === 'SLEEP_HOURS' ? 'Client Sleeping' : 'Business Hours'}`}
            >
              {localTime.status === 'SLEEP_HOURS' ? '🌙' : '🟢'} {localTime.timeString}
            </span>
          </div>

          {/* Row 3: Company + last message preview */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="text-xs text-slate-500 truncate">
              {lead.company && <span className="font-medium text-slate-700">{lead.company} · </span>}
              {lastMsg?.body ?? 'No messages yet'}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_DOT[lead.stage] ?? '#94a3b8' }} />
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs" style={{ background: '#ef4444' }}>
                  {unread}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Direct Calling Action Icon */}
      <a
        href={telLink(lead.phone)}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 flex-shrink-0"
        title={`Call ${lead.name}`}
      >
        <Phone size={14} style={{ color: '#C9A84C' }} />
      </a>
    </div>
  )
})

export const KanbanBoard = memo(function KanbanBoard({
  leads,
  filter,
  onFilterChange,
  onSelect,
  selectedId,
}: Props) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (filter !== 'ALL') {
        const normalized =
          l.stage === 'NEW'
            ? 'NEW_INQUIRY'
            : l.stage === 'TALKING'
            ? 'SCENT_RECOMMENDATION'
            : l.stage === 'DONE'
            ? 'DELIVERED'
            : l.stage
        if (normalized !== filter) return false
      }
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase().trim()
        if (
          !l.name.toLowerCase().includes(q) &&
          !l.phone.includes(q) &&
          !(l.company ?? '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [leads, filter, debouncedSearch])

  // DOM Virtualization for 5,000+ leads
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 92,
    overscan: 6,
  })

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-white">
      {/* Search & Counter */}
      <div className="px-3 py-2.5 flex-shrink-0 border-b border-slate-100">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search 5,000+ Indian perfume clients..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 placeholder-slate-400"
            style={{ '--tw-ring-color': '#C9A84C' } as any}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mt-1.5 font-medium">
          <span>
            Virtualized: Rendering visible of{' '}
            <strong className="text-slate-700 font-mono">{filtered.length.toLocaleString()}</strong> clients
          </span>
          {leads.length >= 2000 && (
            <span className="text-amber-700 font-semibold">✨ 5,000 Portfolio Virtualized</span>
          )}
        </div>
      </div>

      {/* Stage chips */}
      <div className="px-3 py-2 flex gap-1.5 flex-shrink-0 overflow-x-auto border-b border-slate-100">
        {STAGES.map(s => (
          <button
            key={s.key}
            onClick={() => onFilterChange(s.key)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition border whitespace-nowrap cursor-pointer"
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

      {/* DOM-Virtualized Leads Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative contain-strict"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400">No clients match your filter</p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const lead = filtered[virtualRow.index]
              if (!lead) return null
              const isSelected = selectedId === lead.id

              return (
                <div
                  key={lead.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <LeadRow
                    lead={lead}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})
