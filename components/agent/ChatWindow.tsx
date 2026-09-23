'use client'
import { useState, useEffect, useRef } from 'react'
import { Paperclip, Smile, Wand2, Send, Bot, AlertCircle, Phone, MessageCircle, Mic, Sparkles } from 'lucide-react'
import { QuickRepliesPopup } from './QuickRepliesPopup'
import { VoiceNoteBubble } from './VoiceNoteBubble'
import { VoiceNoteRecorder } from './VoiceNoteRecorder'
import type { Lead, Message, QuickReply } from './AgentWorkspace'
import { formatPhoneDisplay, parsePhone, waLink, telLink } from '@/lib/countries'

interface Props {
  lead: Lead
  quickReplies: QuickReply[]
  onNewMessage: (leadId: string, msg: Message) => void
}

function isUserOffline(msgs: Message[]): boolean {
  const last = [...msgs].reverse().find(m => m.direction === 'INBOUND')
  if (!last) return false
  return Date.now() - new Date(last.createdAt).getTime() > 24 * 60 * 60 * 1000
}

function fmtTime(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

function fmtDate(d: string) {
  const dt = new Date(d); const t = new Date()
  const y = new Date(t); y.setDate(y.getDate() - 1)
  if (dt.toDateString() === t.toDateString()) return 'Today'
  if (dt.toDateString() === y.toDateString()) return 'Yesterday'
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function groupMsgs(msgs: Message[]) {
  const g: { date: string; msgs: Message[] }[] = []
  for (const m of msgs) {
    const d = fmtDate(m.createdAt)
    const last = g[g.length - 1]
    if (last && last.date === d) last.msgs.push(m); else g.push({ date: d, msgs: [m] })
  }
  return g
}

export function ChatWindow({ lead, quickReplies, onNewMessage }: Props) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const btm = useRef<HTMLDivElement>(null)
  const msgs = lead.conversation?.messages ?? []
  const offline = isUserOffline(msgs)
  const groups = groupMsgs(msgs)
  const { country } = parsePhone(lead.phone)
  const displayPhone = formatPhoneDisplay(lead.phone)

  useEffect(() => { btm.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  function onInput(v: string) { setInput(v); setShowQR(v.startsWith('/')) }
  function onQR(body: string) { setInput(body); setShowQR(false) }

  async function send() {
    if (!input.trim() || sending) return
    setSending(true)
    const body = input.trim(); setInput(''); setShowQR(false)
    const tmp: Message = { id: Date.now().toString(), body, direction: 'OUTBOUND', type: 'TEXT', senderType: 'agent', createdAt: new Date().toISOString(), isRead: false }
    onNewMessage(lead.id, tmp)
    try {
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: lead.id, body, type: 'TEXT' }) })
    } finally { setSending(false) }
  }

  async function sendVoiceNote(duration: string) {
    setIsRecordingVoice(false)
    const tmp: Message = {
      id: Date.now().toString(),
      body: `Voice Note (${duration})`,
      direction: 'OUTBOUND',
      type: 'AUDIO',
      senderType: 'agent',
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    onNewMessage(lead.id, tmp)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, body: `Voice Note (${duration})`, type: 'AUDIO' }),
      })
    } catch {}
  }

  async function triggerAIAutoReply() {
    if (aiLoading) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/bot/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          customerMessage: msgs.filter(m => m.direction === 'INBOUND').slice(-1)[0]?.body,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.message) {
          onNewMessage(lead.id, data.message)
        }
      }
    } catch {}
    finally { setAiLoading(false) }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Professional Calling & WhatsApp Integration */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: '#0F1729' }}>
            {lead.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
            <div className="flex items-center gap-1.5">
              {country && <span className="text-sm leading-none">{country.flag}</span>}
              <p className="text-xs text-slate-400 font-mono tracking-wide truncate">{displayPhone}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* AI Auto-Reply Trigger Button */}
          <button
            onClick={triggerAIAutoReply}
            disabled={aiLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition"
            title="Generate AI Auto-Reply"
          >
            <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">AI Auto-Reply</span>
          </button>

          {/* WhatsApp Direct Link */}
          <a
            href={waLink(lead.phone)}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition"
            title="Open WhatsApp Web"
          >
            <MessageCircle size={16} />
          </a>

          {/* Professional Direct Calling Icon */}
          <a
            href={telLink(lead.phone)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95"
            style={{ background: '#0F1729' }}
            title={`Direct Voice Call to ${displayPhone}`}
          >
            <Phone size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">Call</span>
          </a>

          <span className="hidden md:inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{
            background: lead.stage === 'NEW' ? '#eff6ff' : lead.stage === 'TALKING' ? '#FDF6E3' : lead.stage === 'ORDER_PLACED' ? '#f5f3ff' : '#f0fdf4',
            color: lead.stage === 'NEW' ? '#3b82f6' : lead.stage === 'TALKING' ? '#C9A84C' : lead.stage === 'ORDER_PLACED' ? '#8b5cf6' : '#10b981',
          }}>
            {lead.stage === 'NEW' ? 'New' : lead.stage === 'TALKING' ? 'Talking' : lead.stage === 'ORDER_PLACED' ? 'Order Placed' : 'Done'}
          </span>
        </div>
      </div>

      {/* 24h Offline banner */}
      {offline && (
        <div className="mx-4 mt-3 flex items-start gap-2.5 p-3 rounded-xl border text-sm flex-shrink-0" style={{ background: '#FDF6E3', borderColor: '#E8D5A0', color: '#8B7A3D' }}>
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
          <div><span className="font-medium">User offline for 24+ hours.</span> Use a message template to reach them.</div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-slate-50/40">
        {groups.map(g => (
          <div key={g.date}>
            <div className="flex items-center justify-center my-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold text-slate-400 bg-white border border-slate-100">{g.date}</span>
            </div>
            {g.msgs.map(m => (
              <div key={m.id} className={`flex mb-2 ${m.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                {/* Voice Note Audio Bubble */}
                {m.type === 'AUDIO' ? (
                  <VoiceNoteBubble
                    duration="0:14"
                    direction={m.direction as any}
                    timestamp={fmtTime(m.createdAt)}
                  />
                ) : m.type === 'BOT' || m.senderType === 'ai_assistant' ? (
                  /* AI Auto-Reply Message Bubble */
                  <div className="max-w-xs md:max-w-md bg-violet-50/80 border border-violet-100 rounded-2xl p-3.5 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px] font-bold">
                        AI
                      </div>
                      <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">AI Assistant (Auto-Reply)</span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                    <p className="text-[10px] text-violet-400 mt-1.5 font-mono">{fmtTime(m.createdAt)}</p>
                  </div>
                ) : m.type === 'NOTE' ? (
                  /* Private Internal Note */
                  <div className="max-w-xs rounded-2xl p-3 border" style={{ background: '#FDF6E3', borderColor: '#E8D5A0' }}>
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: '#C9A84C' }}>Private Note</p>
                    <p className="text-xs" style={{ color: '#8B7A3D' }}>{m.body}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#C9A84C80' }}>{fmtTime(m.createdAt)}</p>
                  </div>
                ) : (
                  /* Standard Text Chat Bubble */
                  <div className="max-w-xs md:max-w-md rounded-2xl px-3.5 py-2.5 shadow-xs" style={{
                    background: m.direction === 'OUTBOUND' ? '#0F1729' : '#fff',
                    color: m.direction === 'OUTBOUND' ? '#fff' : '#334155',
                    border: m.direction === 'INBOUND' ? '1px solid #e2e8f0' : 'none',
                    borderRadius: m.direction === 'OUTBOUND' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  }}>
                    <p className="text-sm leading-relaxed">{m.body}</p>
                    <p className="text-[10px] mt-1 text-right font-mono" style={{ color: m.direction === 'OUTBOUND' ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
                      {fmtTime(m.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={btm} />
      </div>

      {/* Input / Voice Note Recording Bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
        <div className="relative">
          {showQR && <QuickRepliesPopup quickReplies={quickReplies} onSelect={onQR} />}

          {isRecordingVoice ? (
            <VoiceNoteRecorder
              onSend={sendVoiceNote}
              onCancel={() => setIsRecordingVoice(false)}
            />
          ) : (
            <div className="flex items-end gap-2">
              <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition flex-shrink-0" title="Attach file">
                <Paperclip size={16} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => onInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Type a message... (/ for quick replies)"
                  rows={1}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 resize-none placeholder-slate-400"
                  style={{ '--tw-ring-color': '#C9A84C', minHeight: 42 } as any}
                />
              </div>

              {/* Voice Note Mic Button */}
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-amber-50/50 text-slate-600 hover:text-amber-700 transition flex-shrink-0 active:scale-95"
                title="Record Voice Note"
              >
                <Mic size={16} style={{ color: '#C9A84C' }} />
              </button>

              <button
                type="button"
                onClick={triggerAIAutoReply}
                disabled={aiLoading}
                className="p-2 rounded-xl hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition flex-shrink-0"
                title="AI Auto-Reply Assistant"
              >
                <Wand2 size={16} />
              </button>

              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-xl text-white transition flex-shrink-0 disabled:opacity-40 active:scale-95"
                style={{ background: '#0F1729' }}
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
