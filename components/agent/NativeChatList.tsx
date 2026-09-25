'use client'
import { useState, useMemo, useRef } from 'react'
import {
  Search,
  Pin,
  Archive,
  Trash2,
  CheckCheck,
  Sparkles,
  MessageSquare,
  X,
  RotateCcw,
} from 'lucide-react'
import type { Lead } from './AgentWorkspace'
import { parsePhone, formatPhoneDisplay } from '@/lib/countries'

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

export function NativeChatList({
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
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [swipedLeadId, setSwipedLeadId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)

  // Filter out archived leads unless searched
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

  // Filter & Sort: Pinned leads always at top, then by most recent message
  const filteredLeads = useMemo(() => {
    let list = activeLeads

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.businessRequirement && l.businessRequirement.toLowerCase().includes(q))
      )
    }

    // Filter unread
    if (filter === 'UNREAD') {
      list = list.filter(l => {
        const msgs = l.conversation?.messages ?? []
        return msgs.some(m => !m.isRead && m.direction === 'INBOUND')
      })
    }

    // Sort: pinned first, then updatedAt desc
    return [...list].sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id)
      const bPinned = pinnedIds.includes(b.id)
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      const aTime = new Date(a.updatedAt || a.conversation?.messages?.slice(-1)[0]?.createdAt || 0).getTime()
      const bTime = new Date(b.updatedAt || b.conversation?.messages?.slice(-1)[0]?.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [activeLeads, search, filter, pinnedIds])

  // Touch Handlers for Native Swiping
  function handleTouchStart(e: React.TouchEvent, leadId: string) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = true
    setSwipedLeadId(leadId)
  }

  function handleTouchMove(e: React.TouchEvent, leadId: string) {
    if (!isSwiping.current || swipedLeadId !== leadId) return
    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current

    // Don't intercept vertical scrolling
    if (Math.abs(diffY) > Math.abs(diffX)) {
      return
    }

    // Clamp offset between -140px (left swipe: Archive/Delete) and +90px (right swipe: Pin)
    const clamped = Math.max(-140, Math.min(90, diffX))
    setSwipeOffset(clamped)
  }

  function handleTouchEnd(leadId: string) {
    isSwiping.current = false
    if (swipeOffset > 60) {
      // Swiped right enough -> Toggle Pin
      onTogglePin(leadId)
      resetSwipe()
    } else if (swipeOffset < -90) {
      // Keep action buttons open on left swipe
      setSwipeOffset(-130)
    } else {
      resetSwipe()
    }
  }

  function resetSwipe() {
    setSwipeOffset(0)
    setSwipedLeadId(null)
  }

  function formatChatTime(dateStr?: string) {
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

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. Sleek Native Messaging App Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-serif text-slate-900 tracking-wide">
              Chats
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {activeLeads.length}
            </span>
          </div>

          {/* Minimal Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Sync</span>
          </div>
        </div>

        {/* 2. Ultra-Clean Search Bar */}
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
            All
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
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">
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

      {/* 4. Native Chat Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No conversations found</p>
          </div>
        ) : (
          filteredLeads.map(lead => {
            const isSelected = selectedId === lead.id
            const isPinned = pinnedIds.includes(lead.id)
            const msgs = lead.conversation?.messages ?? []
            const lastMsg = msgs[msgs.length - 1]
            const hasUnread = msgs.some(m => !m.isRead && m.direction === 'INBOUND')
            const lastTime = formatChatTime(lastMsg?.createdAt || lead.updatedAt)
            const { country } = parsePhone(lead.phone)
            const isCurrentSwiped = swipedLeadId === lead.id
            const currentOffset = isCurrentSwiped ? swipeOffset : 0

            return (
              <div
                key={lead.id}
                className="relative overflow-hidden group bg-white"
                onTouchStart={e => handleTouchStart(e, lead.id)}
                onTouchMove={e => handleTouchMove(e, lead.id)}
                onTouchEnd={() => handleTouchEnd(lead.id)}
              >
                {/* Swipe Action Background Behind Card */}
                {/* Left side revealed on Swipe Right -> Pin */}
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

                {/* Right side revealed on Swipe Left -> Archive & Delete */}
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
                    transition: isSwiping.current && isCurrentSwiped ? 'none' : 'transform 0.25s ease-out',
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

                  {/* Desktop Hover Quick Actions (for desktop users without touch) */}
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
        )}
      </div>
    </div>
  )
}
