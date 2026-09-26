'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ChatWindow } from './ChatWindow'
import { NativeChatList } from './NativeChatList'
import { LeadLabelType } from '@/lib/labels'

const LeadCaptureModal = dynamic(
  () => import('./LeadCaptureModal').then(m => m.LeadCaptureModal),
  { ssr: false }
)

export interface Message {
  id: string
  body: string
  direction: string
  type: string
  senderType: string
  createdAt: string
  isRead: boolean
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  businessRequirement?: string
  country?: string
  sourceUrl?: string
  leadSource?: string
  stage: string
  tag: string
  label?: LeadLabelType | string
  conversationStatus?: string
  assignedAgentId?: string
  assignedAgent?: { id: string; name: string }
  conversation?: { id: string; messages: Message[] }
  updatedAt: string
}

export interface Agent {
  id: string
  name: string
  status: string
}

export interface QuickReply {
  id: string
  title: string
  body: string
}

interface Props {
  initialLeads: Lead[]
  agents: Agent[]
  quickReplies: QuickReply[]
  currentUserId: string
}

export function AgentWorkspace({
  initialLeads,
  agents,
  quickReplies,
}: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(initialLeads[0] ?? null)
  const [showModal, setShowModal] = useState(false)
  const [modalPrefillPhone, setModalPrefillPhone] = useState('')
  const [mobile, setMobile] = useState<'leads' | 'chat'>('leads')
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [archivedIds, setArchivedIds] = useState<string[]>([])

  // Load pinned and archived IDs from localStorage on mount
  useEffect(() => {
    try {
      const savedPinned = localStorage.getItem('bperfume_pinned_leads')
      if (savedPinned) setPinnedIds(JSON.parse(savedPinned))
      const savedArchived = localStorage.getItem('bperfume_archived_leads')
      if (savedArchived) setArchivedIds(JSON.parse(savedArchived))
    } catch {}
  }, [])

  useEffect(() => {
    function handleOpenLeadModal(e: any) {
      if (e?.detail?.phone) {
        setModalPrefillPhone(e.detail.phone)
      } else {
        setModalPrefillPhone('')
      }
      setShowModal(true)
    }

    function handleAgentTab(e: any) {
      const tab = e?.detail?.tab
      if (tab === 'chats' || tab === 'leads') {
        setMobile('leads')
      }
    }

    window.addEventListener('mn:open-lead-modal', handleOpenLeadModal)
    window.addEventListener('bperfume:agent-tab', handleAgentTab)
    return () => {
      window.removeEventListener('mn:open-lead-modal', handleOpenLeadModal)
      window.removeEventListener('bperfume:agent-tab', handleAgentTab)
    }
  }, [])

  // Poll leads updates
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch('/api/leads')
        if (!res.ok) return
        const data: Lead[] = await res.json()
        setLeads(data)
        if (selected) {
          const u = data.find(l => l.id === selected.id)
          if (u) setSelected(u)
        }
      } catch {}
    }, 5000)
    return () => clearInterval(t)
  }, [selected])

  const onSelect = useCallback((lead: Lead) => {
    setSelected(lead)
    setMobile('chat')
  }, [])

  const onUpdate = useCallback((updated: Lead) => {
    setLeads(p => p.map(l => (l.id === updated.id ? updated : l)))
    setSelected(prev => (prev?.id === updated.id ? updated : prev))
  }, [])

  const onNewMessage = useCallback((leadId: string, msg: Message) => {
    setLeads(prev =>
      prev.map(l => {
        if (l.id !== leadId) return l
        const c = l.conversation ?? { id: 'tmp', messages: [] }
        return { ...l, conversation: { ...c, messages: [...c.messages, msg] } }
      })
    )
    setSelected(prev => {
      if (!prev || prev.id !== leadId) return prev
      const c = prev.conversation ?? { id: 'tmp', messages: [] }
      return { ...prev, conversation: { ...c, messages: [...c.messages, msg] } }
    })
  }, [])

  const onTogglePin = useCallback((leadId: string) => {
    setPinnedIds(prev => {
      const next = prev.includes(leadId) ? prev.filter(id => id !== leadId) : [leadId, ...prev]
      try {
        localStorage.setItem('bperfume_pinned_leads', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const onToggleArchive = useCallback((leadId: string) => {
    setArchivedIds(prev => {
      const next = prev.includes(leadId) ? prev.filter(id => id !== leadId) : [leadId, ...prev]
      try {
        localStorage.setItem('bperfume_archived_leads', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const onDeleteLead = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId))
    setSelected(prev => (prev?.id === leadId ? null : prev))
  }, [])

  const onUpdateLeadLabel = useCallback(async (leadId: string, label: LeadLabelType) => {
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, label } : l)))
    setSelected(prev => (prev?.id === leadId ? { ...prev, label } : prev))

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
    } catch (err) {
      console.warn('[Workspace] Could not persist label update to server:', err)
    }
  }, [])

  return (
    <div className="flex flex-1 h-full bg-white overflow-hidden">
      {/* 
        THE 3-ELEMENT RULE APPLIED GLOBALLY:
        1. Top App Bar (in layout)
        2. Single Simple Search Bar (at top of NativeChatList)
        3. The Chat List directly below it (inside NativeChatList)
        NO large analytics cards, NO kanban buttons, NO channel filters, NO nested headers.
      */}

      {/* Left Column: Pure Native Chat List with Single Search Bar */}
      <div
        className={`flex-col bg-white border-r border-slate-100 lg:flex lg:w-[350px] lg:flex-shrink-0 ${
          mobile === 'leads' ? 'flex w-full' : 'hidden'
        } lg:flex`}
      >
        <NativeChatList
          leads={leads}
          selectedId={selected?.id}
          onSelect={onSelect}
          pinnedIds={pinnedIds}
          onTogglePin={onTogglePin}
          archivedIds={archivedIds}
          onToggleArchive={onToggleArchive}
          onDeleteLead={onDeleteLead}
          onUpdateLeadLabel={onUpdateLeadLabel}
        />
      </div>

      {/* Right Column: Flat Minimalist Native Chat Window */}
      <div
        className={`flex-1 flex-col min-w-0 bg-white lg:flex ${
          mobile === 'chat' ? 'flex w-full' : 'hidden'
        } lg:flex`}
      >
        {selected ? (
          <ChatWindow
            lead={selected}
            quickReplies={quickReplies}
            onNewMessage={onNewMessage}
            onBack={() => setMobile('leads')}
            onUpdateLeadLabel={onUpdateLeadLabel}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white">
            <div className="opacity-[0.08] select-none pointer-events-none text-center space-y-1">
              <span
                style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                className="text-7xl font-light text-[#0A0F1D] tracking-widest block"
              >
                B
              </span>
              <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#0A0F1D]">
                Haute Parfumerie Clienteling
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobile('leads')}
              className="lg:hidden mt-6 px-4 py-2 rounded-lg text-xs font-medium text-white"
              style={{ background: '#0A0F1D' }}
            >
              Open Conversations
            </button>
          </div>
        )}
      </div>

      {/* Lead Capture Modal (Triggered only when adding a lead via dialer) */}
      {showModal && (
        <LeadCaptureModal
          agents={agents}
          initialPhone={modalPrefillPhone}
          onClose={() => {
            setShowModal(false)
            setModalPrefillPhone('')
          }}
          onSaved={(lead: any) => {
            setLeads(p => [lead, ...p])
            setSelected(lead)
            setMobile('chat')
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
