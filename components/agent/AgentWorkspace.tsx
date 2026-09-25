'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { KanbanBoard } from './KanbanBoard'
import { ChatWindow } from './ChatWindow'
import { ContextPanel } from './ContextPanel'
import { getConvStatus } from './PipelineDashboard'
import { NativeChatList } from './NativeChatList'

const PipelineDashboard = dynamic(
  () => import('./PipelineDashboard').then(m => m.PipelineDashboard),
  { ssr: false, loading: () => <div className="p-8 text-center text-xs text-slate-400">Loading Dashboard...</div> }
)
const InteractiveKanban = dynamic(
  () => import('./InteractiveKanban').then(m => m.InteractiveKanban),
  { ssr: false, loading: () => <div className="p-8 text-center text-xs text-slate-400">Loading Kanban...</div> }
)
const LeadCaptureModal = dynamic(
  () => import('./LeadCaptureModal').then(m => m.LeadCaptureModal),
  { ssr: false }
)
import {
  Plus,
  MessageSquare,
  Info,
  List,
  Columns3,
  LayoutList,
  CheckSquare,
  Target,
  X,
  CheckCircle,
  LayoutDashboard,
  MessageCircle,
  Users,
} from 'lucide-react'

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
  currentUserId,
}: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(initialLeads[0] ?? null)
  const [workspaceView, setWorkspaceView] = useState<'chats' | 'leads'>('chats')
  const [pipeFilter, setPipeFilter] = useState('ALL')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [modalPrefillPhone, setModalPrefillPhone] = useState('')
  const [mobile, setMobile] = useState<'leads' | 'chat' | 'details'>('leads')
  const [viewMode, setViewMode] = useState<'split' | 'kanban'>('split')
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'INSTAGRAM' | 'EMAIL'>('ALL')
  const [showTasksDrawer, setShowTasksDrawer] = useState(false)
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [archivedIds, setArchivedIds] = useState<string[]>([])
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Curate 5 bespoke CITYMAN Extrait recommendations', completed: true },
    { id: 't2', title: 'Confirm 4 pending flacon orders with delivery in Delhi & Mumbai', completed: true },
    { id: 't3', title: 'Advise VIP clients on 12-hour Extrait formulation differences', completed: false },
    { id: 't4', title: 'Follow up with dormant clients interested in Oud Royale Extrait', completed: false },
  ])

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
      if (tab === 'chats' || tab === 'chat') {
        setWorkspaceView('chats')
        setMobile('leads') // Shows the chat list
      } else if (tab === 'leads' || tab === 'dashboard') {
        setWorkspaceView('leads')
      } else if (tab === 'tasks') {
        setShowTasksDrawer(true)
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

  const visibleLeads = useMemo(() => {
    return leads.filter(l => {
      if (pipeFilter !== 'ALL' && getConvStatus(l) !== pipeFilter) return false
      if (channelFilter !== 'ALL') {
        const src = (l.sourceUrl || '').toLowerCase()
        if (channelFilter === 'WHATSAPP' && (src.includes('instagram') || src.includes('email'))) return false
        if (channelFilter === 'INSTAGRAM' && !src.includes('instagram')) return false
        if (channelFilter === 'EMAIL' && !src.includes('email')) return false
      }
      return true
    })
  }, [leads, pipeFilter, channelFilter])

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* View Switcher Top Bar (Clean separation of Chats vs Leads/Dashboard) */}
      <div className="bg-white border-b border-slate-200/70 px-4 py-2 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setWorkspaceView('chats')
              setMobile('leads')
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              workspaceView === 'chats'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageCircle size={14} />
            <span>Chats</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceView('leads')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              workspaceView === 'leads'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Leads &amp; Pipeline</span>
          </button>
        </div>

        {/* Right Action: Daily Tasks & New Lead */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTasksDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            <CheckSquare size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">Tasks</span>
            <span className="text-[10px] font-mono text-amber-800">
              ({tasks.filter(t => t.completed).length}/{tasks.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95"
            style={{ background: '#0F1729' }}
          >
            <Plus size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ULTRA-CLEAN NATIVE CHAT WINDOW (WhatsApp / iMessage Style) */}
      {workspaceView === 'chats' && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Ultra-Clean Native Chat List with Swipe Actions */}
          <div
            className={`flex-col bg-white border-r border-slate-100 lg:flex lg:w-[340px] lg:flex-shrink-0 ${
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
            />
          </div>

          {/* Center Column: Native Chat Conversation Screen */}
          <div
            className={`flex-1 flex-col min-w-0 border-r border-slate-100 lg:flex ${
              mobile === 'chat' ? 'flex w-full' : 'hidden'
            } lg:flex`}
          >
            {selected ? (
              <ChatWindow
                lead={selected}
                quickReplies={quickReplies}
                onNewMessage={onNewMessage}
                onBack={() => setMobile('leads')}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-[#fbf9f5]">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: '#FDF6E3' }}
                >
                  <MessageSquare size={28} style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="font-bold text-slate-800 font-serif">B Perfume Clienteling</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select a client conversation from the list to start fragrance consultation
                </p>
                <button
                  type="button"
                  onClick={() => setMobile('leads')}
                  className="lg:hidden mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                  style={{ background: '#0F1729' }}
                >
                  Open Chat List
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Context & Client Details (Desktop Only) */}
          <div
            className={`flex-col bg-white lg:w-[280px] lg:flex-shrink-0 lg:flex ${
              mobile === 'details' ? 'flex w-full' : 'hidden'
            } lg:flex`}
          >
            {selected ? (
              <ContextPanel
                lead={selected}
                agents={agents}
                onUpdate={onUpdate}
                currentUserId={currentUserId}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-400">No client selected</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DEDICATED LEADS & PIPELINE DASHBOARD (Analytics Cards & Kanban) */}
      {workspaceView === 'leads' && (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {/* Analytics Cards Header: VIP Leads, Orders, Indian Clients */}
          <PipelineDashboard
            leads={leads}
            active={pipeFilter}
            onChange={f => {
              setPipeFilter(f)
            }}
          />

          {/* Secondary Controls Bar: Mode Switcher & Omnichannel Filter */}
          <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'split'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutList size={13} />
                <span>Leads Roster</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Columns3 size={13} style={{ color: viewMode === 'kanban' ? '#C9A84C' : undefined }} />
                <span>Interactive Kanban</span>
              </button>
            </div>

            {/* Omnichannel Channel Filter */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Channels', icon: '🌐' },
                { id: 'WHATSAPP', label: 'WhatsApp', icon: '🟢' },
                { id: 'INSTAGRAM', label: 'Instagram', icon: '🟣' },
                { id: 'EMAIL', label: 'Email', icon: '🔵' },
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannelFilter(ch.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                    channelFilter === ch.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
                  }`}
                >
                  <span>{ch.icon}</span>
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kanban or Leads Table */}
          <div className="flex-1 min-h-0">
            {viewMode === 'kanban' ? (
              <InteractiveKanban
                leads={visibleLeads}
                onSelect={lead => {
                  setSelected(lead)
                  setWorkspaceView('chats')
                  setMobile('chat')
                }}
                selectedId={selected?.id}
                onUpdate={onUpdate}
              />
            ) : (
              <div className="flex flex-1 min-h-0 h-full">
                <div className="w-full bg-white">
                  <KanbanBoard
                    leads={visibleLeads}
                    filter={stageFilter}
                    onFilterChange={setStageFilter}
                    onSelect={lead => {
                      setSelected(lead)
                      setWorkspaceView('chats')
                      setMobile('chat')
                    }}
                    selectedId={selected?.id}
                    onUpdate={onUpdate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Lead Modal */}
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
            setWorkspaceView('chats')
            setMobile('chat')
            setShowModal(false)
          }}
        />
      )}

      {/* Personal Daily Tasks & Quota Drawer */}
      {showTasksDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ background: '#0A0F1D' }}
                >
                  <CheckSquare size={16} style={{ color: '#C9A84C' }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">
                    My Daily Tasks &amp; Goals
                  </h4>
                  <p className="text-[10px] text-slate-400">B Perfume Luxury Sales Specialist</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTasksDrawer(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Performance Quota Progress */}
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target size={14} style={{ color: '#C9A84C' }} /> Flacon Quota (CITYMAN &amp; Oud)
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">82% Achieved</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: '82%', background: '#C9A84C' }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Response</p>
                    <p className="text-sm font-bold text-slate-800">2.4m</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Consults</p>
                    <p className="text-sm font-bold text-slate-800">28</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Bottles Sold</p>
                    <p className="text-sm font-bold text-amber-700">19</p>
                  </div>
                </div>
              </div>

              {/* Interactive Daily Task Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Today&apos;s Action Items
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {tasks.filter(t => t.completed).length} of {tasks.length} Completed
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() =>
                        setTasks(prev =>
                          prev.map(item =>
                            item.id === t.id ? { ...item, completed: !item.completed } : item
                          )
                        )
                      }
                      className={`p-3 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        t.completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          t.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {t.completed && <CheckCircle size={13} />}
                      </div>
                      <span className="text-xs font-medium flex-1">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowTasksDrawer(false)}
                className="w-full py-2.5 rounded-xl text-white text-xs font-semibold"
                style={{ background: '#0F1729' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
