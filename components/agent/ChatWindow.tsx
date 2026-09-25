'use client'
import { useState, useEffect, useRef, memo } from 'react'
import { Paperclip, Send, AlertCircle, Phone, MessageCircle, Mic, Sparkles, Clock, ShieldAlert, Zap, ArrowLeft, CheckCircle2, Receipt } from 'lucide-react'
import { QuickRepliesPopup } from './QuickRepliesPopup'
import { VoiceNoteBubble } from './VoiceNoteBubble'
import { VoiceNoteRecorder } from './VoiceNoteRecorder'
import { WhatsAppInvoiceModal } from './WhatsAppInvoiceModal'
import { PerfumeCheatSheetCard } from './PerfumeCheatSheetCard'
import { QuickLuxuryRepliesMenu } from './QuickLuxuryRepliesMenu'
import { OFFICIAL_PERFUME_CATALOG, PerfumeProduct, findPerfumeByText } from '@/lib/products'
import type { Lead, Message, QuickReply } from './AgentWorkspace'
import { formatPhoneDisplay, parsePhone, waLink, telLink, getCountryLocalTime } from '@/lib/countries'
import { analyzeSentiment, calculatePredictiveScore } from '@/lib/ai-scoring'

interface Props {
  lead: Lead
  quickReplies: QuickReply[]
  onNewMessage: (leadId: string, msg: Message) => void
  onBack?: () => void
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

const STAGE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  NEW_INQUIRY: { label: 'New Inquiry', bg: '#eff6ff', color: '#3b82f6' },
  NEW: { label: 'New Inquiry', bg: '#eff6ff', color: '#3b82f6' },
  SCENT_RECOMMENDATION: { label: 'Scent Recommendation', bg: '#FDF6E3', color: '#C9A84C' },
  TALKING: { label: 'Scent Recommendation', bg: '#FDF6E3', color: '#C9A84C' },
  ORDER_PLACED: { label: 'Order Placed', bg: '#f5f3ff', color: '#8b5cf6' },
  SHIPPED: { label: 'Shipped', bg: '#ecfdf5', color: '#059669' },
  DELIVERED: { label: 'Delivered', bg: '#f0fdf4', color: '#10b981' },
  DONE: { label: 'Delivered', bg: '#f0fdf4', color: '#10b981' },
}

export const ChatWindow = memo(function ChatWindow({ lead, quickReplies, onNewMessage, onBack }: Props) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [detectedPerfume, setDetectedPerfume] = useState<PerfumeProduct | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceTargetProduct, setInvoiceTargetProduct] = useState<PerfumeProduct | null>(null)
  const [showLuxuryMenu, setShowLuxuryMenu] = useState(false)
  const btm = useRef<HTMLDivElement>(null)
  const msgs = lead.conversation?.messages ?? []
  const offline = isUserOffline(msgs)
  const groups = groupMsgs(msgs)
  const { country } = parsePhone(lead.phone)
  const displayPhone = formatPhoneDisplay(lead.phone)

  // Enterprise Intelligence Metrics
  const localTimeInfo = getCountryLocalTime(lead.phone)
  const sentimentInfo = analyzeSentiment(msgs)
  const scoreInfo = calculatePredictiveScore(lead)
  const currentStageInfo = STAGE_LABELS[lead.stage] || STAGE_LABELS.NEW_INQUIRY

  // 15-minute SLA breach calculation
  const lastInbound = [...msgs].reverse().find(m => m.direction === 'INBOUND')
  const lastInboundTime = lastInbound ? new Date(lastInbound.createdAt).getTime() : 0
  const minutesSinceInbound = lastInbound ? Math.floor((Date.now() - lastInboundTime) / 60000) : 0
  const slaBreached = (lead.tag === 'HOT' || lead.tag === 'WARM') && minutesSinceInbound >= 15 && !escalated

  function handleEscalate() {
    setEscalated(true)
    const notificationMsg: Message = {
      id: Date.now().toString(),
      body: `⚡ SLA ESCALATION: Lead automatically escalated to Senior Scent Operations Manager due to 15m unanswered threshold.`,
      direction: 'OUTBOUND',
      type: 'NOTE',
      senderType: 'system_escalation',
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    onNewMessage(lead.id, notificationMsg)
  }

  useEffect(() => { btm.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  // Real-time Perfume Detection for Agent Cheat Sheet
  useEffect(() => {
    const lastCustomerMsg = [...msgs].reverse().find(m => m.direction === 'INBOUND')?.body || ''
    const textToScan = `${input} ${lastCustomerMsg}`
    if (textToScan.trim()) {
      const match = findPerfumeByText(textToScan)
      if (match) {
        setDetectedPerfume(match)
      }
    }
  }, [input, msgs])

  function onInput(v: string) { setInput(v); setShowQR(v.startsWith('/')) }
  function onQR(body: string) { setInput(body); setShowQR(false) }

  function insertPerfumeRecommendation(template: string) {
    setInput(template)
  }

  async function send(customBody?: string) {
    const textToSend = typeof customBody === 'string' ? customBody : input.trim()
    if (!textToSend || sending) return
    setSending(true)
    setInput('')
    setShowQR(false)
    setShowLuxuryMenu(false)
    const tmp: Message = { id: Date.now().toString(), body: textToSend, direction: 'OUTBOUND', type: 'TEXT', senderType: 'agent', createdAt: new Date().toISOString(), isRead: false }
    onNewMessage(lead.id, tmp)
    try {
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: lead.id, body: textToSend, type: 'TEXT' }) })
    } finally { setSending(false) }
  }

  async function triggerAIAutoReply() {
    setAiLoading(true)
    try {
      const res = await fetch('/api/bot/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          customerMessage: msgs.filter(m => m.direction === 'INBOUND').slice(-1)[0]?.body || 'I would like to inquire about B Perfume fragrances.'
        }),
      })
      const data = await res.json()
      if (data?.message) {
        onNewMessage(lead.id, data.message)
      }
    } catch (err) {
      console.warn('AI auto-reply trigger error:', err)
    } finally {
      setAiLoading(false)
    }
  }

  async function sendVoiceNote(duration: string) {
    setIsRecordingVoice(false)

    const voiceMsg: Message = {
      id: Date.now().toString(),
      body: `🎙️ Voice Note (${duration})`,
      direction: 'OUTBOUND',
      type: 'MEDIA',
      senderType: 'agent',
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    ;(voiceMsg as any).duration = duration

    onNewMessage(lead.id, voiceMsg)

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          body: `🎙️ Voice Note (${duration})`,
          type: 'MEDIA',
        }),
      })
    } catch {}
  }

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] min-w-0">
      {/* Top Header - Mobile Native App Optimized */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2 flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back to Leads Navigation Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95 flex items-center gap-1"
              title="Back to Leads"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-semibold">Leads</span>
            </button>
          )}

          {/* Customer Avatar */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs"
            style={{ background: 'linear-gradient(135deg, #0A0F1D 0%, #1A2338 100%)', border: '1px solid rgba(201,168,76,0.3)' }}>
            {lead.name.charAt(0)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-slate-800 truncate">{lead.name}</span>
              {country && <span className="text-xs leading-none">{country.flag}</span>}
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">{displayPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {lead.company && <span className="truncate">{lead.company}</span>}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 font-medium">B Perfume VIP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Luxury Fragrance Consultant AI Trigger Button */}
          <button
            onClick={triggerAIAutoReply}
            disabled={aiLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition cursor-pointer"
            title="Luxury Scent Consultant AI Auto-Reply"
          >
            <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">AI Consultant</span>
          </button>

          {/* 1-Click WhatsApp Invoice */}
          <button
            type="button"
            onClick={() => {
              setInvoiceTargetProduct(detectedPerfume || OFFICIAL_PERFUME_CATALOG[0])
              setShowInvoiceModal(true)
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-950 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
            title="Generate 1-Click WhatsApp Order Summary / Invoice"
          >
            <Receipt size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">WhatsApp Invoice</span>
          </button>

          {/* WhatsApp Direct Link */}
          <a
            href={waLink(lead.phone)}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition"
            title="Open in WhatsApp"
          >
            <MessageCircle size={16} />
          </a>

          {/* Professional Direct Calling Icon */}
          <a
            href={telLink(lead.phone)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            style={{ background: '#0A0F1D' }}
            title={`Direct Call to ${displayPhone}`}
          >
            <Phone size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden sm:inline">Call</span>
          </a>

          <span
            className="hidden md:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: currentStageInfo.bg, color: currentStageInfo.color }}
          >
            {currentStageInfo.label}
          </span>
        </div>
      </div>

      {/* Intelligence Sub-Header: Local Time & Predictive Score */}
      <div className="px-4 py-2 bg-white/70 backdrop-blur-xs border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Local Time & Sleep Warning */}
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            style={{ background: localTimeInfo.bg, color: localTimeInfo.color }}
            title={`Local Time: ${localTimeInfo.timezoneName}`}
          >
            <Clock size={11} />
            <span>{localTimeInfo.badgeText}</span>
          </span>

          {/* Predictive Lead Score */}
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            style={{ background: scoreInfo.bg, color: scoreInfo.color }}
            title={`AI Intent: ${scoreInfo.label}`}
          >
            <span>🎯 Scent Buying Intent: {scoreInfo.score}/100</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>India WhatsApp Verified (+91)</span>
        </div>
      </div>

      {/* 15-Minute SLA Breach Overdue Warning & Manager Escalation */}
      {slaBreached && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs flex-shrink-0 animate-pulse">
          <div className="flex items-center gap-2 text-red-700">
            <ShieldAlert size={16} className="text-red-600 flex-shrink-0" />
            <span>
              <strong>⚠️ Overdue SLA:</strong> Fragrance client waiting for <strong>{minutesSinceInbound} minutes</strong> without staff reply.
            </span>
          </div>
          <button
            type="button"
            onClick={handleEscalate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px] shadow-xs hover:bg-red-700 transition active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Zap size={12} />
            <span>Escalate to Manager</span>
          </button>
        </div>
      )}

      {/* 24h Offline Alert */}
      {offline && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800 flex-shrink-0">
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
          <span>More than 24 hours since customer&apos;s last message. Scent re-engagement template recommended.</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-slate-400">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs"
              style={{ background: '#FDF6E3', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Sparkles size={20} style={{ color: '#C9A84C' }} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Fresh Client Conversation</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              No previous messages. Click below or send a bespoke recommendation to begin consultation.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => insertPerfumeRecommendation('Dear Client, thank you for reaching out to B Perfume Haute Parfumerie. Which collection may we curate for you today: Men, Women, or Unisex?')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-amber-300 text-slate-700 shadow-2xs transition"
              >
                🌸 Welcome Consultation
              </button>
              <button
                type="button"
                onClick={() => insertPerfumeRecommendation('We are delighted to present CITYMAN Extrait de Parfum — our iconic 12-hour long-lasting masculine formulation.')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-amber-300 text-slate-700 shadow-2xs transition"
              >
                🎩 CITYMAN Extrait Intro
              </button>
            </div>
          </div>
        )}

        {groups.map(g => (
          <div key={g.date} className="space-y-3">
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200/70 text-[10px] font-semibold text-slate-500 shadow-2xs">
                {g.date}
              </span>
            </div>

            {g.msgs.map(m => (
              <div key={m.id} className={`flex ${m.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                {m.type === 'MEDIA' ? (
                  <VoiceNoteBubble
                    duration={typeof (m as any).duration === 'string' ? (m as any).duration : '0:14'}
                    direction={m.direction as any}
                    timestamp={m.createdAt}
                  />
                ) : m.type === 'NOTE' ? (
                  <div className="max-w-xs rounded-2xl p-3 border" style={{ background: '#FDF6E3', borderColor: '#E8D5A0' }}>
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: '#C9A84C' }}>Private Note</p>
                    <p className="text-xs" style={{ color: '#8B7A3D' }}>{m.body}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#C9A84C80' }}>{fmtTime(m.createdAt)}</p>
                  </div>
                ) : (
                  <div className="max-w-xs md:max-w-md rounded-2xl px-3.5 py-2.5 shadow-xs" style={{
                    background: m.direction === 'OUTBOUND' ? '#0A0F1D' : '#fff',
                    color: m.direction === 'OUTBOUND' ? '#fff' : '#334155',
                    border: m.direction === 'INBOUND' ? '1px solid #e2e8f0' : 'none',
                    borderRadius: m.direction === 'OUTBOUND' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  }}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>

                    <div className="flex items-center justify-end gap-2 mt-1.5">
                      <p className="text-[10px] font-mono" style={{ color: m.direction === 'OUTBOUND' ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
                        {fmtTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={btm} />
      </div>

      {/* Agent 'Cheat Sheet' Pop-up Card */}
      {detectedPerfume && (
        <div className="px-4 py-2 bg-transparent flex-shrink-0 max-w-xl mx-auto w-full">
          <PerfumeCheatSheetCard
            product={detectedPerfume}
            onClose={() => setDetectedPerfume(null)}
            onInsertPitch={text => setInput(text)}
            onOpenInvoice={prod => {
              setInvoiceTargetProduct(prod)
              setShowInvoiceModal(true)
            }}
          />
        </div>
      )}

      {/* Input / Voice Note Recording Bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
        <div className="relative">
          {showQR && <QuickRepliesPopup quickReplies={quickReplies} onSelect={onQR} />}

          {/* Quick Luxury Reply Popup Menu (⚡) */}
          <QuickLuxuryRepliesMenu
            isOpen={showLuxuryMenu}
            onClose={() => setShowLuxuryMenu(false)}
            onSelect={(body, sendImmediately) => {
              if (sendImmediately) {
                send(body)
              } else {
                setInput(body)
              }
            }}
          />

          {isRecordingVoice ? (
            <VoiceNoteRecorder
              onSend={sendVoiceNote}
              onCancel={() => setIsRecordingVoice(false)}
            />
          ) : (
            <div className="flex items-end gap-1.5 sm:gap-2">
              {/* Attach File Button */}
              <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition flex-shrink-0" title="Attach file">
                <Paperclip size={16} />
              </button>

              {/* ⚡ Quick Luxury Reply Integration Button */}
              <button
                type="button"
                onClick={() => setShowLuxuryMenu(prev => !prev)}
                className={`p-2 rounded-xl border transition flex-shrink-0 active:scale-95 flex items-center justify-center ${
                  showLuxuryMenu
                    ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-xs'
                    : 'bg-amber-50/80 border-amber-300/80 hover:bg-amber-100 text-amber-700'
                }`}
                title="Quick Luxury Replies (⚡)"
              >
                <Zap size={16} className={showLuxuryMenu ? 'fill-slate-900 text-slate-900' : 'fill-amber-500 text-amber-600'} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => onInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Type fragrance advice... (/ or ⚡ for luxury replies)"
                  rows={1}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:outline-hidden focus:ring-2 resize-none placeholder-slate-400"
                  style={{ '--tw-ring-color': '#C9A84C', minHeight: 42 } as any}
                />
              </div>

              {/* Voice Note Button */}
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition flex-shrink-0 active:scale-95"
                title="Record Voice Note"
              >
                <Mic size={16} style={{ color: '#C9A84C' }} />
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-xl text-white transition disabled:opacity-40 flex-shrink-0 shadow-xs active:scale-95 cursor-pointer"
                style={{ background: '#0A0F1D' }}
                title="Send Message"
              >
                <Send size={16} style={{ color: '#C9A84C' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* One-Click WhatsApp Invoice Modal */}
      <WhatsAppInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSendInvoice={invoiceText => {
          setInput(invoiceText)
        }}
        clientName={lead.name}
        clientPhone={lead.phone}
        preselectedProduct={invoiceTargetProduct}
      />
    </div>
  )
})
