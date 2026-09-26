'use client'
import { useState, useEffect, useRef, memo } from 'react'
import {
  Paperclip,
  Send,
  Phone,
  MessageCircle,
  Mic,
  Sparkles,
  Clock,
  Zap,
  ArrowLeft,
  Receipt,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
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

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(d: string) {
  const dt = new Date(d)
  const t = new Date()
  const y = new Date(t)
  y.setDate(y.getDate() - 1)
  if (dt.toDateString() === t.toDateString()) return 'Today'
  if (dt.toDateString() === y.toDateString()) return 'Yesterday'
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function groupMsgs(msgs: Message[]) {
  const g: { date: string; msgs: Message[] }[] = []
  for (const m of msgs) {
    const d = fmtDate(m.createdAt)
    const last = g[g.length - 1]
    if (last && last.date === d) last.msgs.push(m)
    else g.push({ date: d, msgs: [m] })
  }
  return g
}

const STAGE_LABELS: Record<string, string> = {
  NEW_INQUIRY: 'New Inquiry',
  NEW: 'New Inquiry',
  SCENT_RECOMMENDATION: 'Scent Recommendation',
  TALKING: 'Scent Recommendation',
  ORDER_PLACED: 'Order Placed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  DONE: 'Delivered',
}

export const ChatWindow = memo(function ChatWindow({
  lead,
  quickReplies,
  onNewMessage,
  onBack,
}: Props) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [detectedPerfume, setDetectedPerfume] = useState<PerfumeProduct | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceTargetProduct, setInvoiceTargetProduct] = useState<PerfumeProduct | null>(null)
  const [showLuxuryMenu, setShowLuxuryMenu] = useState(false)
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)

  const btm = useRef<HTMLDivElement>(null)
  const msgs = lead.conversation?.messages ?? []
  const groups = groupMsgs(msgs)
  const { country } = parsePhone(lead.phone)
  const displayPhone = formatPhoneDisplay(lead.phone)

  // Preserved Intelligence Metrics (Hidden inside slide-out profile drawer)
  const localTimeInfo = getCountryLocalTime(lead.phone)
  const sentimentInfo = analyzeSentiment(msgs)
  const scoreInfo = calculatePredictiveScore(lead)
  const currentStageName = STAGE_LABELS[lead.stage] || 'Active Consultation'

  useEffect(() => {
    btm.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

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

  function onInput(v: string) {
    setInput(v)
    setShowQR(v.startsWith('/'))
  }

  function onQR(body: string) {
    setInput(body)
    setShowQR(false)
  }

  async function send(customBody?: string) {
    const textToSend = typeof customBody === 'string' ? customBody : input.trim()
    if (!textToSend || sending) return
    setSending(true)
    setInput('')
    setShowQR(false)
    setShowLuxuryMenu(false)
    const tmp: Message = {
      id: Date.now().toString(),
      body: textToSend,
      direction: 'OUTBOUND',
      type: 'TEXT',
      senderType: 'agent',
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    onNewMessage(lead.id, tmp)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, body: textToSend, type: 'TEXT' }),
      })
    } finally {
      setSending(false)
    }
  }

  async function triggerAIAutoReply() {
    setAiLoading(true)
    try {
      const res = await fetch('/api/bot/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          customerMessage:
            msgs.filter(m => m.direction === 'INBOUND').slice(-1)[0]?.body ||
            'I would like to inquire about B Perfume fragrances.',
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
    <div className="flex flex-col h-full bg-white min-w-0 relative">
      {/* 1. STRIPPED CHAT HEADER: ONLY Client Name and clean Back button */}
      <div className="h-14 px-4 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-1.5 -ml-1 text-slate-700 hover:text-black transition"
              aria-label="Back to chat list"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* Client's Name — Tapping opens the slide-out Client Profile drawer */}
          <button
            type="button"
            onClick={() => setShowProfileDrawer(true)}
            className="flex items-center gap-2 text-left truncate group cursor-pointer"
            title="View Client Profile & Metadata"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold tracking-wider flex-shrink-0"
              style={{ background: '#0A0F1D' }}
            >
              {lead.name.charAt(0)}
            </div>
            <div className="truncate">
              <span className="text-sm font-semibold text-[#0A0F1D] tracking-tight group-hover:underline">
                {lead.name}
              </span>
            </div>
          </button>
        </div>

        {/* Minimal Info Trigger */}
        <button
          type="button"
          onClick={() => setShowProfileDrawer(true)}
          className="text-xs font-medium text-slate-400 hover:text-[#0A0F1D] transition px-2 py-1"
          aria-label="Open Client Info"
        >
          Details
        </button>
      </div>

      {/* 2. MESSAGES SCROLL AREA (FLAT UI & PURE WHITESPACE) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative">
        {/* EMPTY STATE ELEGANCE: Pure whitespace with faint B Perfume watermark */}
        {groups.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="text-center opacity-[0.06] space-y-2">
              <span
                style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                className="text-6xl sm:text-7xl font-light text-[#0A0F1D] tracking-widest block"
              >
                B
              </span>
              <p className="text-[11px] font-serif uppercase tracking-[0.35em] text-[#0A0F1D]">
                B Perfume · Haute Parfumerie
              </p>
            </div>
          </div>
        )}

        {groups.map(g => (
          <div key={g.date} className="space-y-3">
            <div className="flex items-center justify-center">
              <span className="px-2.5 py-0.5 text-[10px] font-medium text-slate-400 tracking-wider uppercase">
                {g.date}
              </span>
            </div>

            {g.msgs.map(m => (
              <div
                key={m.id}
                className={`flex ${m.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
              >
                {m.type === 'MEDIA' ? (
                  <VoiceNoteBubble
                    duration={
                      typeof (m as any).duration === 'string' ? (m as any).duration : '0:14'
                    }
                    direction={m.direction as any}
                    timestamp={m.createdAt}
                  />
                ) : m.type === 'NOTE' ? (
                  <div className="max-w-xs rounded-xl p-3 border border-slate-200 bg-slate-50 text-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Internal Advisor Note
                    </p>
                    <p className="text-xs">{m.body}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      {fmtTime(m.createdAt)}
                    </p>
                  </div>
                ) : (
                  <div
                    className="max-w-xs md:max-w-md px-4 py-2.5"
                    style={{
                      background: m.direction === 'OUTBOUND' ? '#0A0F1D' : '#FFFFFF',
                      color: m.direction === 'OUTBOUND' ? '#FFFFFF' : '#0F172A',
                      border: m.direction === 'INBOUND' ? '1px solid #E2E8F0' : 'none',
                      borderRadius:
                        m.direction === 'OUTBOUND'
                          ? '16px 16px 2px 16px'
                          : '16px 16px 16px 2px',
                    }}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {m.body}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <p
                        className="text-[9px] font-mono"
                        style={{
                          color:
                            m.direction === 'OUTBOUND'
                              ? 'rgba(255,255,255,0.45)'
                              : '#94A3B8',
                        }}
                      >
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

      {/* Agent Cheat Sheet Card (Detected fragrance pitch helper) */}
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

      {/* 3. INPUT BAR (Flat 1px hairline separation, monochromatic) */}
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
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
                title="Attach file"
              >
                <Paperclip size={16} />
              </button>

              {/* ⚡ Quick Replies Monochromatic Trigger */}
              <button
                type="button"
                onClick={() => setShowLuxuryMenu(prev => !prev)}
                className="p-2 text-slate-400 hover:text-[#0A0F1D] transition flex-shrink-0 active:scale-95"
                title="Quick Luxury Replies (⚡)"
              >
                <Zap size={16} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => onInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Type message... (/ for replies)"
                  rows={1}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#0A0F1D] transition resize-none placeholder-slate-400"
                  style={{ minHeight: 40 }}
                />
              </div>

              {/* Voice Note Button */}
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2 text-slate-400 hover:text-[#0A0F1D] transition flex-shrink-0"
                title="Record Voice Note"
              >
                <Mic size={16} />
              </button>

              {/* Send Button — Deep Midnight Navy */}
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-lg text-white transition disabled:opacity-30 flex-shrink-0 cursor-pointer"
                style={{ background: '#0A0F1D' }}
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. HIDDEN METADATA: SLIDE-OUT CLIENT PROFILE DRAWER */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#0A0F1D] tracking-tight">
                Client Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-black transition rounded-md hover:bg-slate-100"
                aria-label="Close Profile Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body — Clean Monochromatic Info */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-600">
              {/* Client Summary */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold"
                  style={{ background: '#0A0F1D' }}
                >
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400">{displayPhone}</p>
                  {country && <p className="text-[11px] text-slate-500 mt-0.5">{country.flag} {country.name}</p>}
                </div>
              </div>

              {/* Intelligence Scores & Status */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Client Telemetry
                </h5>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Buying Intent Score</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {scoreInfo.score}/100 ({scoreInfo.label})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">WhatsApp Verification</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified (+91)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Local Time</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {localTimeInfo.timeString} ({localTimeInfo.timezoneName})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pipeline Stage</span>
                    <span className="font-semibold text-slate-900">
                      {currentStageName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Actions
                </h5>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={telLink(lead.phone)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-800 font-medium transition"
                  >
                    <Phone size={13} />
                    <span>Direct Call</span>
                  </a>

                  <a
                    href={waLink(lead.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-800 font-medium transition"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* 1-Click Invoice */}
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceTargetProduct(detectedPerfume || OFFICIAL_PERFUME_CATALOG[0])
                    setShowInvoiceModal(true)
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-800 font-medium transition mt-1 cursor-pointer"
                >
                  <Receipt size={13} />
                  <span>Generate Order Invoice</span>
                </button>

                {/* AI Consultant */}
                <button
                  type="button"
                  onClick={triggerAIAutoReply}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-white font-medium transition disabled:opacity-50 cursor-pointer"
                  style={{ background: '#0A0F1D' }}
                >
                  <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} />
                  <span>{aiLoading ? 'Generating...' : 'AI Scent Auto-Reply'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
