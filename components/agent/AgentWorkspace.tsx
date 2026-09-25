'use client'
import { useState, useEffect } from 'react'
import { KanbanBoard } from './KanbanBoard'
import { InteractiveKanban } from './InteractiveKanban'
import { ChatWindow } from './ChatWindow'
import { ContextPanel } from './ContextPanel'
import { PipelineDashboard, getConvStatus } from './PipelineDashboard'
import { LeadCaptureModal } from './LeadCaptureModal'
import { Plus, MessageSquare, Info, List, Columns3, LayoutList, CheckSquare, Target, X, CheckCircle } from 'lucide-react'
import { BPerfumeLogo, BPerfumeWordmark } from '@/components/shared/BPerfumeLogo'

export interface Message {
  id: string; body: string; direction: string; type: string
  senderType: string; createdAt: string; isRead: boolean
}

export interface Lead {
  id: string; name: string; phone: string; email?: string; company?: string
  businessRequirement?: string; country?: string; sourceUrl?: string; leadSource?: string
  stage: string; tag: string; conversationStatus?: string
  assignedAgentId?: string; assignedAgent?: { id: string; name: string }
  conversation?: { id: string; messages: Message[] }
  updatedAt: string
}

export interface Agent { id: string; name: string; status: string }
export interface QuickReply { id: string; title: string; body: string }

interface Props {
  initialLeads: Lead[]; agents: Agent[]
  quickReplies: QuickReply[]; currentUserId: string
}

export function AgentWorkspace({ initialLeads, agents, quickReplies, currentUserId }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(initialLeads[0] ?? null)
  const [pipeFilter, setPipeFilter] = useState('ALL')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [modalPrefillPhone, setModalPrefillPhone] = useState('')
  const [mobile, setMobile] = useState<'leads' | 'chat' | 'details'>('leads')
  const [viewMode, setViewMode] = useState<'split' | 'kanban'>('split')
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'INSTAGRAM' | 'EMAIL'>('ALL')
  const [showTasksDrawer, setShowTasksDrawer] = useState(false)
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Curate 5 bespoke CITYMAN Extrait recommendations', completed: true },
    { id: 't2', title: 'Confirm 4 pending flacon orders with delivery in Delhi & Mumbai', completed: true },
    { id: 't3', title: 'Advise VIP clients on 12-hour Extrait formulation differences', completed: false },
    { id: 't4', title: 'Follow up with dormant clients interested in Oud Royale Extrait', completed: false },
  ])

  useEffect(() => {
    function handleOpenLeadModal(e: any) {
      if (e?.detail?.phone) {
        setModalPrefillPhone(e.detail.phone)
      } else {
        setModalPrefillPhone('')
      }
      setShowModal(true)
    }
    window.addEventListener('mn:open-lead-modal', handleOpenLeadModal)
    return () => window.removeEventListener('mn:open-lead-modal', handleOpenLeadModal)
  }, [])

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

  function onSelect(lead: Lead) { setSelected(lead); setMobile('chat') }

  function onUpdate(updated: Lead) {
    setLeads(p => p.map(l => l.id === updated.id ? updated : l))
    if (selected?.id === updated.id) setSelected(updated)
  }

  function onNewMessage(leadId: string, msg: Message) {
    const upd = (prev: Lead[]) => prev.map(l => {
      if (l.id !== leadId) return l
      const c = l.conversation ?? { id: 'tmp', messages: [] }
      return { ...l, conversation: { ...c, messages: [...c.messages, msg] } }
    })
    setLeads(upd)
    setSelected(p => {
      if (!p || p.id !== leadId) return p
      const c = p.conversation ?? { id: 'tmp', messages: [] }
      return { ...p, conversation: { ...c, messages: [...c.messages, msg] } }
    })
  }

  function onLeadSaved(lead: Lead) {
    setLeads(p => [lead, ...p])
    setSelected(lead)
    setMobile('chat')
  }

  const visibleLeads = leads.filter(l => {
    if (pipeFilter !== 'ALL' && getConvStatus(l) !== pipeFilter) return false
    if (channelFilter !== 'ALL') {
      const src = (l.sourceUrl || '').toLowerCase()
      if (channelFilter === 'WHATSAPP' && (src.includes('instagram') || src.includes('email'))) return false
      if (channelFilter === 'INSTAGRAM' && !src.includes('instagram')) return false
      if (channelFilter === 'EMAIL' && !src.includes('email')) return false
    }
    return true
  })

  const unread = leads.filter(l => getConvStatus(l) === 'UNREAD').length

  return (
    <div className="flex flex-col h-full">
      <PipelineDashboard leads={leads} active={pipeFilter} onChange={f => { setPipeFilter(f); setMobile('leads') }} />

      {/* View Mode Bar */}
      <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'split' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutList size={13} />
            <span>Chat & Leads</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'kanban' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Columns3 size={13} style={{ color: viewMode === 'kanban' ? '#C9A84C' : undefined }} />
            <span>Interactive Kanban Pipeline</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Personal Daily Tasks & Performance Widget Button */}
          <button
            type="button"
            onClick={() => setShowTasksDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            <CheckSquare size={13} style={{ color: '#C9A84C' }} />
            <span>Daily Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95"
            style={{ background: '#0F1729' }}
          >
            <Plus size={12} /> New Lead
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <InteractiveKanban
          leads={visibleLeads}
          onSelect={lead => {
            setSelected(lead)
            setViewMode('split')
            setMobile('chat')
          }}
          selectedId={selected?.id}
          onUpdate={onUpdate}
        />
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Col 1: Leads */}
          <div className={`flex-col bg-white border-r border-slate-100 lg:flex lg:w-[300px] lg:flex-shrink-0 ${mobile === 'leads' ? 'flex w-full' : 'hidden'} lg:flex`}>
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {pipeFilter === 'ALL' ? 'All Leads' : pipeFilter.charAt(0) + pipeFilter.slice(1).toLowerCase()}
                <span className="ml-1 text-slate-400">({visibleLeads.length})</span>
              </span>
            </div>

            {/* Omnichannel Channel Filter */}
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center gap-1 overflow-x-auto bg-slate-50/50 flex-shrink-0">
              {[
                { id: 'ALL', label: 'All Channels', icon: '🌐' },
                { id: 'WHATSAPP', label: 'WhatsApp', icon: '🟢' },
                { id: 'INSTAGRAM', label: 'Instagram', icon: '🟣' },
                { id: 'EMAIL', label: 'Email', icon: '🔵' },
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannelFilter(ch.id as any)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 whitespace-nowrap ${
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
            <KanbanBoard leads={visibleLeads} filter={stageFilter} onFilterChange={setStageFilter} onSelect={onSelect} selectedId={selected?.id} onUpdate={onUpdate} />
          </div>

          {/* Col 2: Chat */}
          <div className={`flex-1 flex-col min-w-0 border-r border-slate-100 lg:flex ${mobile === 'chat' ? 'flex w-full' : 'hidden'} lg:flex`}>
          {selected ? (
            <ChatWindow lead={selected} quickReplies={quickReplies} onNewMessage={onNewMessage} onBack={() => setMobile('leads')} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#FDF6E3' }}>
                <MessageSquare size={28} style={{ color: '#C9A84C' }} />
              </div>
              <p className="font-semibold text-slate-700">Select a lead to chat</p>
              <p className="text-sm text-slate-400 mt-1">Choose from the leads list on the left</p>
              <button onClick={() => setMobile('leads')} className="lg:hidden mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#0F1729' }}>View Leads</button>
            </div>
          )}
        </div>

          {/* Col 3: Context */}
          <div className={`flex-col bg-white lg:w-[280px] lg:flex-shrink-0 lg:flex ${mobile === 'details' ? 'flex w-full' : 'hidden'} lg:flex`}>
            {selected ? (
              <ContextPanel lead={selected} agents={agents} onUpdate={onUpdate} currentUserId={currentUserId} />
            ) : (
              <div className="flex-1 flex items-center justify-center"><p className="text-sm text-slate-400">No lead selected</p></div>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="lg:hidden flex bg-white border-t border-slate-100 safe-area-inset-bottom flex-shrink-0">
        {([
          { key: 'leads' as const, icon: List, label: 'Leads', badge: unread },
          { key: 'chat' as const, icon: MessageSquare, label: 'Chat', badge: 0 },
          { key: 'details' as const, icon: Info, label: 'Details', badge: 0 },
        ]).map(t => (
          <button key={t.key} onClick={() => setMobile(t.key)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition"
            style={{ color: mobile === t.key ? '#C9A84C' : '#94a3b8' }}>
            <t.icon size={20} />
            <span className="text-[10px] font-medium">{t.label}</span>
            {t.badge > 0 && <span className="absolute top-2 right-1/4 w-4 h-4 rounded-full bg-red-400 text-white text-[9px] font-bold flex items-center justify-center">{t.badge}</span>}
          </button>
        ))}
      </div>

      {showModal && (
        <LeadCaptureModal
          agents={agents}
          initialPhone={modalPrefillPhone}
          onClose={() => {
            setShowModal(false)
            setModalPrefillPhone('')
          }}
          onSaved={onLeadSaved}
        />
      )}

      {/* Slide-Over Drawer: Personal Daily Task List & KPIs */}
      {showTasksDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: '#0A0F1D' }}>
                    <CheckSquare size={16} style={{ color: '#C9A84C' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">B Perfume Advisor Daily Action</h3>
                    <p className="text-[11px] text-slate-400">Exclusive Fragrance Clienteling Mode</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTasksDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Personal KPI Widget */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target size={14} style={{ color: '#C9A84C' }} /> Flacon Sales Quota (CITYMAN &amp; Oud)
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">82% Target Achieved</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '82%', background: '#C9A84C' }} />
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
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Today&apos;s Action Items</span>
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
                          prev.map(item => (item.id === t.id ? { ...item, completed: !item.completed } : item))
                        )
                      }
                      className={`p-3 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        t.completed ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
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
