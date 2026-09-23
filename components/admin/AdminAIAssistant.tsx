'use client'
import { useState } from 'react'
import { Sparkles, Send, Download, TrendingUp, Users, DollarSign, ShieldAlert, Bot, CheckCircle2, RefreshCw } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function AdminAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Welcome to the Super Admin Executive AI

I am your private strategic intelligence assistant for **MN Brand CRM**. I analyze live data across **2,000+ international leads** and **50 staff members** to deliver real-time business insights, pipeline forecasting, and operational recommendations.

Select a quick action below or ask me any question regarding your sales pipeline and team operations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    totalLeads: '2,000+',
    totalPipelineValue: '$4,950,000',
    closedRevenue: '$1,620,000',
    activeStaff: '50 Agents',
  })

  async function handleSend(promptText?: string, action: string = 'custom') {
    const text = (promptText || input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!promptText) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, action }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, aiMsg])

        if (data.metrics) {
          setMetrics({
            totalLeads: `${data.metrics.totalLeads.toLocaleString()}`,
            totalPipelineValue: `$${data.metrics.totalPipelineValue.toLocaleString()} USD`,
            closedRevenue: `$${data.metrics.closedRevenue.toLocaleString()} USD`,
            activeStaff: `${data.metrics.activeStaff} Agents`,
          })
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '⚠️ Unable to process query. Please check your admin privileges.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Network or system error occurred while generating executive analysis.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function downloadReport() {
    const fullTranscript = messages
      .map(m => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n\n${'-'.repeat(40)}`)
      .join('\n\n')

    const header = `# MN BRAND CRM — EXECUTIVE INTELLIGENCE BRIEF\nGenerated: ${new Date().toLocaleString()}\n\n`
    const blob = new Blob([header + fullTranscript], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `MN_Brand_Executive_AI_Report_${Date.now()}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const QUICK_PROMPTS = [
    { label: '📊 Conversion Funnel Health', prompt: 'Audit full pipeline conversion health and stage velocity', action: 'audit' },
    { label: '💰 Revenue & Pipeline Forecast', prompt: 'Forecast total revenue and deal pipeline across all leads', action: 'forecast' },
    { label: '👥 50 Staff Members Audit', prompt: 'Audit 50 staff members workload and lead distribution', action: 'agents' },
    { label: '🚨 At-Risk Leads Audit', prompt: 'Identify all high-value at-risk leads requiring immediate attention', action: 'risk' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ background: '#0F1729' }}>
              <Sparkles size={16} style={{ color: '#C9A84C' }} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Executive AI Assistant</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private, admin-only strategic analytics for lead pipeline, revenue, and team efficiency.
          </p>
        </div>

        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs self-start sm:self-auto"
        >
          <Download size={13} style={{ color: '#C9A84C' }} />
          <span>Export Executive Brief (.md)</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Total Leads</span>
            <Users size={14} className="text-blue-500" />
          </div>
          <p className="text-lg font-bold text-slate-800">{metrics.totalLeads}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across 40+ countries</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">In-Flight Pipeline</span>
            <TrendingUp size={14} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-lg font-bold text-slate-800">{metrics.totalPipelineValue}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">+18.4% vs last period</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Closed Revenue</span>
            <DollarSign size={14} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-800">{metrics.closedRevenue}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Booked orders</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Staff Management</span>
            <Users size={14} className="text-purple-500" />
          </div>
          <p className="text-lg font-bold text-slate-800">{metrics.activeStaff}</p>
          <p className="text-[10px] text-blue-600 font-medium mt-0.5">Balanced Distribution</p>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.prompt, p.action)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 transition shadow-xs disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Display Window */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-xs"
                  style={{ background: '#0F1729' }}
                >
                  <Bot size={16} style={{ color: '#C9A84C' }} />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'text-white'
                    : 'bg-slate-50 border border-slate-100 text-slate-800'
                }`}
                style={{
                  background: m.role === 'user' ? '#0F1729' : undefined,
                }}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                <div
                  className="text-[10px] mt-2 font-mono"
                  style={{
                    color: m.role === 'user' ? 'rgba(255,255,255,0.4)' : '#94a3b8',
                    textAlign: m.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
              <RefreshCw size={14} className="animate-spin text-amber-500" />
              <span>Analyzing lead records and generating executive intelligence...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about leads, sales projections, staff performance..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-none focus:ring-2 placeholder-slate-400 shadow-xs"
              style={{ '--tw-ring-color': '#C9A84C' } as any}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs md:text-sm font-semibold transition disabled:opacity-40 shadow-xs"
              style={{ background: '#0F1729' }}
            >
              <Send size={14} />
              <span className="hidden sm:inline">Analyze</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
