'use client'
import { useState } from 'react'
import { ExternalLink, Tag, ArrowRightLeft, StickyNote, CheckCircle, User, MessageCircle, Clock, Bell, Briefcase, Globe } from 'lucide-react'
import type { Lead, Agent } from './AgentWorkspace'
import { PhoneActionBar } from './PhoneActionBar'

interface Props {
  lead: Lead
  agents: Agent[]
  onUpdate: (lead: Lead) => void
  currentUserId: string
}

const TAG_OPTS = [
  { value: 'HOT', label: '🔥 Hot Lead' },
  { value: 'WARM', label: '☀️ Warm Lead' },
  { value: 'COLD', label: '❄️ Cold Lead' },
  { value: 'NONE', label: '— No Tag' },
]

const STAGE_OPTS = [
  { value: 'NEW_INQUIRY', label: '1. New Inquiry' },
  { value: 'SCENT_RECOMMENDATION', label: '2. Scent Recommendation' },
  { value: 'ORDER_PLACED', label: '3. Order Placed' },
  { value: 'SHIPPED', label: '4. Shipped' },
  { value: 'DELIVERED', label: '5. Delivered ✓' },
]

const STATUS_OPTS = [
  { value: 'OPEN', label: 'Open', icon: MessageCircle, style: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'WAITING', label: 'Waiting', icon: Clock, style: 'bg-[#FDF6E3] border-[#E8D5A0] text-[#8B7A3D]' },
  { value: 'UNREAD', label: 'Unread', icon: Bell, style: 'text-red-500 bg-red-50 border-red-200' },
  { value: 'CLOSED', label: 'Closed', icon: CheckCircle, style: 'text-slate-500 bg-slate-100 border-slate-200' },
]

export function ContextPanel({ lead, agents, onUpdate, currentUserId }: Props) {
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transferred, setTransferred] = useState(false)
  const [saving, setSaving] = useState(false)
  const [convStatus, setConvStatus] = useState(lead.conversationStatus ?? 'OPEN')

  async function patch(data: Record<string, string>) {
    await fetch(`/api/leads/${lead.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  }

  async function handleTag(tag: string) { onUpdate({ ...lead, tag }); patch({ tag }) }
  async function handleStage(stage: string) { onUpdate({ ...lead, stage }); patch({ stage }) }
  async function handleStatus(s: string) { setConvStatus(s); patch({ conversationStatus: s }) }

  async function saveNote() {
    if (!note.trim()) return
    setSaving(true)
    await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: lead.id, body: note, type: 'NOTE' }) })
    setSavedNote(note); setNote(''); setSaving(false)
  }

  async function transfer() {
    if (!transferTo) return
    const a = agents.find(x => x.id === transferTo)
    if (!a) return
    onUpdate({ ...lead, assignedAgentId: transferTo, assignedAgent: { id: transferTo, name: a.name } })
    patch({ assignedAgentId: transferTo })
    setTransferred(true); setTimeout(() => setTransferred(false), 3000)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Profile */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <User size={13} className="text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</p>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0" style={{ background: '#0F1729' }}>
            {lead.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
            {lead.email && <p className="text-xs text-slate-400 truncate">{lead.email}</p>}
          </div>
        </div>

        <PhoneActionBar phone={lead.phone} name={lead.name} />

        <div className="space-y-2 text-xs mt-3">
          {lead.company && (
            <div className="flex justify-between"><span className="text-slate-400 flex items-center gap-1"><Briefcase size={10} />Company</span><span className="text-slate-600 font-medium">{lead.company}</span></div>
          )}
          {lead.businessRequirement && (
            <div className="flex justify-between"><span className="text-slate-400">Requirement</span><span className="text-slate-600 font-medium text-right max-w-[140px] truncate">{lead.businessRequirement}</span></div>
          )}
          {lead.leadSource && (
            <div className="flex justify-between"><span className="text-slate-400">Source</span><span className="text-slate-600 font-medium">{lead.leadSource}</span></div>
          )}
          {lead.assignedAgent && (
            <div className="flex justify-between"><span className="text-slate-400">Agent</span><span className="text-slate-600 font-medium">{lead.assignedAgent.name}</span></div>
          )}
        </div>
      </div>

      {/* Conversation Status */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Chat Status</p>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUS_OPTS.map(s => {
            const Icon = s.icon; const on = convStatus === s.value
            return (
              <button key={s.value} onClick={() => handleStatus(s.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${on ? s.style : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'}`}>
                <Icon size={11} />{s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tag */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2.5"><Tag size={13} className="text-slate-400" /><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lead Tag</p></div>
        <select value={lead.tag} onChange={e => handleTag(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 bg-white">
          {TAG_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Stage */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2.5"><CheckCircle size={13} className="text-slate-400" /><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</p></div>
        <select
          value={lead.stage === 'NEW' ? 'NEW_INQUIRY' : lead.stage === 'TALKING' ? 'SCENT_RECOMMENDATION' : lead.stage === 'DONE' ? 'DELIVERED' : lead.stage}
          onChange={e => handleStage(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 bg-white"
        >
          {STAGE_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Notes */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2.5"><StickyNote size={13} className="text-slate-400" /><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Private Notes</p><span className="text-[10px] text-slate-300 ml-auto">Invisible to customer</span></div>
        {savedNote && <div className="mb-2 p-2.5 rounded-xl border" style={{ background: '#FDF6E3', borderColor: '#E8D5A0' }}><p className="text-xs" style={{ color: '#8B7A3D' }}>{savedNote}</p></div>}
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add an internal note..." rows={3}
          className="w-full px-3 py-2 rounded-xl border text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 resize-none"
          style={{ borderColor: '#E8D5A0', background: '#FDF6E3' } as any} />
        <button onClick={saveNote} disabled={!note.trim() || saving}
          className="mt-2 w-full py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-40"
          style={{ background: '#FDF6E3', color: '#8B7A3D' }}>
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>

      {/* Transfer */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5"><ArrowRightLeft size={13} className="text-slate-400" /><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transfer Chat</p></div>
        {transferred && <div className="mb-2 p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600">✓ Transferred successfully</div>}
        <select value={transferTo} onChange={e => setTransferTo(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 bg-white mb-2">
          <option value="">Select an agent...</option>
          {agents.filter(a => a.id !== currentUserId).map(a => <option key={a.id} value={a.id}>{a.name} {a.status === 'ONLINE' ? '● Online' : '○ Offline'}</option>)}
        </select>
        <button onClick={transfer} disabled={!transferTo}
          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition disabled:opacity-40 flex items-center justify-center gap-1.5">
          <ArrowRightLeft size={11} /> Transfer
        </button>
      </div>
    </div>
  )
}
