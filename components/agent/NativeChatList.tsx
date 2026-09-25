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
} from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebounce } from '@/lib/hooks/useDebounce'
import type { Lead } from './AgentWorkspace'
import { parsePhone } from '@/lib/countries'

interface Props {
  leads: Lead[]
  selectedId?: string
  onSelect: (lead: Lead) => void
  pinnedIds: string[]
  onTogglePin: (leadId: string) => void
  archivedIds: string[]
  onToggleArchive: (leadId: string) => void
  onDeleteLead: (leadId: string) => void
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
  onTouchStart: (e: React.TouchEvent, leadId: string) => void
  onTouchMove: (e: React.TouchEvent, leadId: string) => void
  onTouchEnd: (leadId: string) => void
  resetSwipe: () => void
}

// Memoized Single Chat Item Row to prevent re-rendering unaffected items
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
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  resetSwipe,
}: RowProps) {
  const msgs = lead.conversation?.messages ?? []
  const lastMsg = msgs[msgs.length - 1]
  const hasUnread = msgs.some(m => !m.isRead && m.direction === 'INBOUND')
  const lastTime = formatChatTime(lastMsg?.createdAt || lead.updatedAt)
  const { country } = parsePhone(lead.phone)
  const currentOffset = isSwiped ? swipeOffset : 0

  return (
    <div
      className="relative overflow-hidden group bg-white border-b border-slate-50"
      onTouchStart={e => onTouchStart(e, lead.id)}
      onTouchMove={e => onTouchMove(e, lead.id)}
      onTouchEnd={() => onTouchEnd(lead.id)}
    >
      {/* Swipe Action Background: Swipe Right -> Pin */}
      <div
        className="absolute inset-y-0 left-0 w-24 bg-amber-500 text-white flex items-center justify-center gap-1 text-xs font-bold transition cursor-pointer"
        onClick={() => {
          onTogglePin(lead.id)
          resetSwipe()
        }}
      >
        <Pin size={15} className={isPinned ? 'fill-white' : ''} />
        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
      </div>

      {/* Swipe Action Background: Swipe Left -> Archive & Delete */}
      <div className="absolute inset-y-0 right-0 w-36 flex">
        <button
          type="button"
          onClick={() => {
            onToggleArchive(lead.id)
            resetSwipe()
          }}
          className="flex-1 bg-slate-700 text-white flex flex-col items-center justify-center text-[10px] font-bold"
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
          className="flex-1 bg-red-600 text-white flex flex-col items-center justify-center text-[10px] font-bold"
        >
          <Trash2 size={14} />
          <span className="mt-0.5">Delete</span>
        </button>
      </div>

      {/* Forefront Chat Item Row */}
      <div
        style={{
          transform: `translateX(${currentOffset}px)`,
          transition: isSwiping && isSwiped ? 'none' : 'transform 0.25s ease-out',
          background: isSelected ? '#FDF6E3' : isPinned ? '#FCFBF7' : '#FFFFFF',
        }}
        onClick={() => {
          if (swipeOffset !== 0) {
            resetSwipe()
            return
          }
          onSelect(lead)
        }}
        className={`w-full px-4 py-3 flex items-center gap-3 cursor-pointer transition relative ${
          isSelected ? 'border-l-4 border-l-[#C9A84C]' : 'border-l-4 border-l-transparent'
        }`}
      >
        {/* Luxury Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 relative shadow-2xs"
          style={{
            background: 'linear-gradient(135deg, #0A0F1D 0%, #1A2338 100%)',
            border: isPinned ? '2px solid #C9A84C' : '1px solid rgba(201,168,76,0.3)',
          }}
        >
          {lead.name.charAt(0)}
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">
                {lead.name}
              </span>
              {country && <span className="text-[11px] leading-none">{country.flag}</span>}
              {isPinned && (
                <Pin size={11} className="text-amber-600 fill-amber-600 flex-shrink-0" />
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
              {lastTime}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500 truncate flex-1 leading-snug">
              {lastMsg ? (
                <>
                  {lastMsg.direction === 'OUTBOUND' && (
                    <CheckCheck size={11} className="inline mr-1 text-[#C9A84C]" />
                  )}
                  {lastMsg.body}
                </>
              ) : (
                <span className="text-slate-400 italic">No messages yet</span>
              )}
            </p>

            {hasUnread && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Desktop Hover Quick Actions */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onTogglePin(lead.id)
            }}
            className="p-1 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-700 transition"
            title={isPinned ? 'Unpin chat' : 'Pin chat to top'}
          >
            <Pin size={12} className={isPinned ? 'fill-amber-600 text-amber-600' : ''} />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onToggleArchive(lead.id)
            }}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
            title="Archive chat"
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
}: Props) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [swipedLeadId, setSwipedLeadId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)

  // Filter out archived leads
  const activeLeads = useMemo(() => {
    return leads.filter(l => !archivedIds.includes(l.id))
  }, [leads, archivedIds])

  // Count unread
  const unreadCount = useMemo(() => {
    return activeLeads.filter(l => {
      const msgs = l.conversation?.messages ?? []
      return msgs.some(m => !m.isRead && m.direction === 'INBOUND')
    }).length
  }, [activeLeads])

  // Filter & Sort using DEBOUNCED query (prevents re-filtering 5,000 items on every keystroke)
  const filteredLeads = useMemo(() => {
    let list = activeLeads

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim()
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.businessRequirement && l.businessRequirement.toLowerCase().includes(q))
      )
    }

    if (filter === 'UNREAD') {
      list = list.filter(l => {
        const msgs = l.conversation?.messages ?? []
        return msgs.some(m => !m.isRead && m.direction === 'INBOUND')
      })
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
  }, [activeLeads, debouncedSearch, filter, pinnedIds])

  // Touch Handlers for Native Swiping
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

    // If scrolling vertically, do not swipe
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 15) {
      isSwiping.current = false
      setSwipeOffset(0)
      return
    }

    // Clamp swipe offset
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

  // DOM Virtualization: Only render the visible rows in the viewport
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: filteredLeads.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 74,
    overscan: 6,
  })

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. Native Messaging App Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-serif text-slate-900 tracking-wide">
              Chats
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {filteredLeads.length.toLocaleString()}
            </span>
          </div>

          {/* Minimal Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Sync</span>
          </div>
        </div>

        {/* 2. Debounced Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8.5 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C9A84C]/40 border border-transparent focus:border-[#C9A84C] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* 3. Minimal Filter Tabs: All vs Unread */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({activeLeads.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === 'UNREAD'
                ? 'bg-slate-900 text-amber-400 shadow-2xs'
                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Swipe Instructions Hint for Mobile */}
      <div className="px-4 py-1 bg-amber-50/50 border-b border-amber-100/50 text-[10px] text-amber-800/80 flex items-center justify-between sm:hidden">
        <span>👉 Swipe right to Pin · 👈 Swipe left to Archive</span>
      </div>

      {/* 4. DOM-Virtualized Chat Items Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative contain-strict"
      >
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No conversations found</p>
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
