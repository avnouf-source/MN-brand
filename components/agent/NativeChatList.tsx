'use client'
import React, { useState, useMemo, useRef, memo, useCallback } from 'react'
import {
  Search,
  Pin,
  Archive,
  Trash2,
  CheckCheck,
  MessageSquare,
  X,
  Tag,
} from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebounce } from '@/lib/hooks/useDebounce'
import {
  SYSTEM_LEAD_LABELS,
  SYSTEM_LABEL_KEYS,
  LeadLabelType,
  getLeadSystemLabel,
} from '@/lib/labels'
import type { Lead } from './AgentWorkspace'

interface Props {
  leads: Lead[]
  selectedId?: string
  onSelect: (lead: Lead) => void
  pinnedIds: string[]
  onTogglePin: (leadId: string) => void
  archivedIds: string[]
  onToggleArchive: (leadId: string) => void
  onDeleteLead: (leadId: string) => void
  onUpdateLeadLabel?: (leadId: string, label: LeadLabelType) => void
}

function formatChatTime(dateStr?: string | Date): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

interface RowProps {
  lead: Lead
  isSelected: boolean
  isPinned: boolean
  isSwiped: boolean
  swipeOffset: number
  isSwiping: boolean
  onSelect: (lead: Lead) => void
  onTogglePin: (leadId: string) => void
  onToggleArchive: (leadId: string) => void
  onDeleteLead: (leadId: string) => void
  onUpdateLeadLabel?: (leadId: string, label: LeadLabelType) => void
  onTouchStart: (e: React.TouchEvent, leadId: string) => void
  onTouchMove: (e: React.TouchEvent, leadId: string) => void
  onTouchEnd: (leadId: string) => void
  resetSwipe: () => void
}

// Ultra-Luxury Monochromatic Chat Item Row with WhatsApp Business Labels
const ChatItemRow = memo(function ChatItemRow({
  lead,
  isSelected,
  isPinned,
  isSwiped,
  swipeOffset,
  isSwiping,
  onSelect,
  onTogglePin,
  onToggleArchive,
  onDeleteLead,
  onUpdateLeadLabel,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  resetSwipe,
}: RowProps) {
  const msgs = lead.conversation?.messages ?? []
  const lastMsg = msgs[msgs.length - 1]
  const hasUnread = msgs.some(m => !m.isRead && m.direction === 'INBOUND')
  const lastTime = formatChatTime(lastMsg?.createdAt || lead.updatedAt)
  const currentOffset = isSwiped ? swipeOffset : 0

  const systemLabel = getLeadSystemLabel(lead)

  return (
    <div
      className="relative overflow-hidden group bg-white border-b border-slate-100/80"
      onTouchStart={e => onTouchStart(e, lead.id)}
      onTouchMove={e => onTouchMove(e, lead.id)}
      onTouchEnd={() => onTouchEnd(lead.id)}
    >
      {/* Monochromatic Swipe Backgrounds */}
      {/* Swipe Right -> Pin */}
      <div
        className="absolute inset-y-0 left-0 w-24 bg-[#0A0F1D] text-white flex items-center justify-center gap-1.5 text-xs font-medium tracking-wider uppercase transition cursor-pointer"
        onClick={() => {
          onTogglePin(lead.id)
          resetSwipe()
        }}
      >
        <Pin size={14} className={isPinned ? 'fill-white' : ''} />
        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
      </div>

      {/* Swipe Left -> Archive & Delete */}
      <div className="absolute inset-y-0 right-0 w-36 flex">
        <button
          type="button"
          onClick={() => {
            onToggleArchive(lead.id)
            resetSwipe()
          }}
          className="flex-1 bg-slate-700 text-white flex flex-col items-center justify-center text-[10px] font-medium tracking-wider uppercase cursor-pointer"
        >
          <Archive size={14} />
          <span className="mt-0.5">Archive</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onDeleteLead(lead.id)
            resetSwipe()
          }}
          className="flex-1 bg-[#1E293B] text-slate-300 hover:text-white flex flex-col items-center justify-center text-[10px] font-medium tracking-wider uppercase cursor-pointer"
        >
          <Trash2 size={14} />
          <span className="mt-0.5">Delete</span>
        </button>
      </div>

      {/* Forefront Chat Item Row — Pure Minimalist White */}
      <div
        style={{
          transform: `translateX(${currentOffset}px)`,
          transition: isSwiping && isSwiped ? 'none' : 'transform 0.25s ease-out',
          background: isSelected ? '#F8FAFC' : '#FFFFFF',
        }}
        onClick={() => {
          if (swipeOffset !== 0) {
            resetSwipe()
            return
          }
          onSelect(lead)
        }}
        className={`w-full px-4 py-3.5 flex items-center gap-3.5 cursor-pointer transition relative ${
          isSelected ? 'border-l-2 border-l-[#0A0F1D]' : 'border-l-2 border-l-transparent'
        }`}
      >
        {/* Monochromatic Luxury Monogram Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold tracking-wider flex-shrink-0 relative"
          style={{ background: '#0A0F1D' }}
        >
          {lead.name.charAt(0)}
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#0A0F1D] border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-xs tracking-tight truncate ${hasUnread ? 'font-bold text-[#0A0F1D]' : 'font-medium text-slate-900'}`}>
                {lead.name}
              </span>
              {isPinned && (
                <Pin size={11} className="text-[#0A0F1D] fill-[#0A0F1D] flex-shrink-0" />
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
              {lastTime}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className={`text-[11px] truncate flex-1 leading-snug ${hasUnread ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
              {lastMsg ? (
                <>
                  {lastMsg.direction === 'OUTBOUND' && (
                    <CheckCheck size={11} className="inline mr-1 text-slate-400" />
                  )}
                  {lastMsg.body}
                </>
              ) : (
                <span className="italic text-slate-400">No messages yet</span>
              )}
            </p>

            {/* WhatsApp Business Visual Label Pill */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide flex-shrink-0"
              style={{
                color: systemLabel.color,
                backgroundColor: systemLabel.bg,
                border: `1px solid ${systemLabel.border}`,
              }}
              title={`Label: ${systemLabel.label} — ${systemLabel.description}`}
            >
              <span className="text-[10px] leading-none">{systemLabel.emoji}</span>
              <span>{systemLabel.label}</span>
            </span>
          </div>
        </div>

        {/* Desktop Quick Actions on Hover */}
        <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onTogglePin(lead.id)
            }}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={12} className={isPinned ? 'fill-[#0A0F1D] text-[#0A0F1D]' : ''} />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onToggleArchive(lead.id)
            }}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
            title="Archive"
          >
            <Archive size={12} />
          </button>
        </div>
      </div>
    </div>
  )
})

export const NativeChatList = memo(function NativeChatList({
  leads,
  selectedId,
  onSelect,
  pinnedIds,
  onTogglePin,
  archivedIds,
  onToggleArchive,
  onDeleteLead,
  onUpdateLeadLabel,
}: Props) {
  const [search, setSearch] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<LeadLabelType | 'ALL'>('ALL')
  const debouncedSearch = useDebounce(search, 300)
  const [swipedLeadId, setSwipedLeadId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)

  // Filter out archived leads AND strictly exclude any AI Test / Mock client from live CRM chat
  const activeLeads = useMemo(() => {
    return leads.filter(
      l =>
        !archivedIds.includes(l.id) &&
        !l.name.toLowerCase().includes('ai test') &&
        !l.name.toLowerCase().includes('mock client') &&
        !l.name.toLowerCase().includes('training')
    )
  }, [leads, archivedIds])

  // Count leads per WhatsApp Business label
  const labelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      NEW_LEAD: 0,
      FOLLOW_UP: 0,
      IMPORTANT: 0,
      CONVERTED: 0,
      LOST: 0,
    }
    for (const l of activeLeads) {
      const lbl = getLeadSystemLabel(l).id
      if (counts[lbl] !== undefined) counts[lbl]++
    }
    return counts
  }, [activeLeads])

  // Filter & Sort using debounced query and active WhatsApp Business label
  const filteredLeads = useMemo(() => {
    let list = activeLeads

    // Label Filter
    if (selectedLabel !== 'ALL') {
      list = list.filter(l => getLeadSystemLabel(l).id === selectedLabel)
    }

    // Search Filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim()
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.businessRequirement && l.businessRequirement.toLowerCase().includes(q))
      )
    }

    return [...list].sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id)
      const bPinned = pinnedIds.includes(b.id)
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      const aTime = new Date(a.updatedAt || a.conversation?.messages?.slice(-1)[0]?.createdAt || 0).getTime()
      const bTime = new Date(b.updatedAt || b.conversation?.messages?.slice(-1)[0]?.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [activeLeads, selectedLabel, debouncedSearch, pinnedIds])

  // Native Swiping Touch Handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, leadId: string) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = true
    setSwipedLeadId(leadId)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent, leadId: string) => {
    if (!isSwiping.current || swipedLeadId !== leadId) return
    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current

    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 15) {
      isSwiping.current = false
      setSwipeOffset(0)
      return
    }

    if (diffX > 0) {
      setSwipeOffset(Math.min(diffX, 96))
    } else {
      setSwipeOffset(Math.max(diffX, -144))
    }
  }, [swipedLeadId])

  const handleTouchEnd = useCallback((leadId: string) => {
    isSwiping.current = false
    if (swipeOffset > 48) {
      onTogglePin(leadId)
      resetSwipe()
    } else if (swipeOffset < -70) {
      setSwipeOffset(-144)
    } else {
      resetSwipe()
    }
  }, [swipeOffset, onTogglePin])

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0)
    setSwipedLeadId(null)
  }, [])

  // DOM Virtualization
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: filteredLeads.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 72,
    overscan: 6,
  })

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. SIMPLE SEARCH BAR */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-slate-100 flex-shrink-0 bg-white">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden border border-slate-200/80 focus:border-[#0A0F1D] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. WHATSAPP BUSINESS-STYLE HORIZONTAL SCROLLABLE LABEL FILTER BAR */}
      <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth bg-white flex-shrink-0">
        {/* All Leads Filter Chip */}
        <button
          type="button"
          onClick={() => setSelectedLabel('ALL')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            selectedLabel === 'ALL'
              ? 'bg-[#0A0F1D] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedLabel === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {activeLeads.length}
          </span>
        </button>

        {/* 5 Primary WhatsApp Business System Labels */}
        {SYSTEM_LABEL_KEYS.map(key => {
          const cfg = SYSTEM_LEAD_LABELS[key]
          const isSelected = selectedLabel === key
          const count = labelCounts[key] || 0

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedLabel(key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition flex items-center gap-1.5 border cursor-pointer ${
                isSelected
                  ? 'shadow-xs ring-1 ring-offset-1'
                  : 'hover:brightness-95'
              }`}
              style={{
                color: isSelected ? '#FFFFFF' : cfg.color,
                backgroundColor: isSelected ? cfg.dot : cfg.bg,
                borderColor: cfg.border,
                boxShadow: isSelected ? `0 2px 8px -1px ${cfg.dot}60` : undefined,
              }}
            >
              <span className="text-[11px] leading-none">{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold"
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                  color: isSelected ? '#FFFFFF' : cfg.color,
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. VIRTUALIZED CHAT LIST */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative contain-strict"
      >
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-25" />
            <p className="text-xs font-medium text-slate-400">No conversations in this view</p>
            {selectedLabel !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedLabel('ALL')}
                className="mt-2 text-[11px] font-semibold text-[#0A0F1D] underline cursor-pointer"
              >
                View all conversations
              </button>
            )}
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
              const lead = filteredLeads[virtualRow.index]
              if (!lead) return null
              const isSelected = selectedId === lead.id
              const isPinned = pinnedIds.includes(lead.id)

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
                  <ChatItemRow
                    lead={lead}
                    isSelected={isSelected}
                    isPinned={isPinned}
                    isSwiped={swipedLeadId === lead.id}
                    swipeOffset={swipedLeadId === lead.id ? swipeOffset : 0}
                    isSwiping={isSwiping.current}
                    onSelect={onSelect}
                    onTogglePin={onTogglePin}
                    onToggleArchive={onToggleArchive}
                    onDeleteLead={onDeleteLead}
                    onUpdateLeadLabel={onUpdateLeadLabel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    resetSwipe={resetSwipe}
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
