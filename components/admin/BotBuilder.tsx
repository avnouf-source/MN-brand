'use client'
import { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Zap, Sparkles, CheckCircle2 } from 'lucide-react'

const STEP_TYPES = [
  { type: 'greeting', label: 'Greeting', color: '#10b981', desc: 'First message to new leads' },
  { type: 'menu', label: 'Menu', color: '#C9A84C', desc: 'Give customers numbered options' },
  { type: 'route', label: 'Route to Agent', color: '#0F1729', desc: 'Transfer to a human agent' },
]

interface Step { id: string; type: string; message: string; options?: string[] }

export function BotBuilder() {
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', type: 'greeting', message: 'Welcome to B Perfume! 🌸 We craft artisanal 12-hour long-lasting luxury fragrances. How can our fragrance advisors assist you today?' },
    { id: '2', type: 'menu', message: 'Please select a fragrance collection:', options: ['CITYMAN Extrait de Parfum (Flagship)', 'Men Collection', 'Women Collection', 'Unisex & Oud Royale'] },
    { id: '3', type: 'route', message: 'Connecting you with a personal B Perfume luxury fragrance consultant now.' },
  ])
  const [active, setActive] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiTone, setAiTone] = useState('executive')

  function addStep(type: string) { setSteps(prev => [...prev, { id: Date.now().toString(), type, message: '', options: type === 'menu' ? ['Option 1', 'Option 2'] : undefined }]) }
  function updateStep(id: string, msg: string) { setSteps(prev => prev.map(s => s.id === id ? { ...s, message: msg } : s)) }
  function removeStep(id: string) { setSteps(prev => prev.filter(s => s.id !== id)) }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Automation & AI Assistant</h1>
          <p className="text-sm text-slate-500 mt-0.5">Automated WhatsApp response flows & AI Auto-Reply</p>
        </div>
        <button
          onClick={() => setActive(!active)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition border"
          style={{ background: active ? '#f0fdf4' : '#fafafa', color: active ? '#10b981' : '#64748b', borderColor: active ? '#bbf7d0' : '#e2e8f0' }}
        >
          {active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {active ? 'Flow Active' : 'Flow Inactive'}
        </button>
      </div>

      {/* AI Auto-Reply Assistant Card */}
      <div className="bg-gradient-to-br from-violet-500/10 via-amber-500/5 to-white rounded-2xl border border-violet-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Auto-Reply Assistant</h2>
              <p className="text-xs text-slate-500">Automatically sends the first response to incoming leads before staff takes over</p>
            </div>
          </div>

          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border"
            style={{
              background: aiEnabled ? '#7C3AED' : '#FFFFFF',
              color: aiEnabled ? '#FFFFFF' : '#64748B',
              borderColor: aiEnabled ? '#7C3AED' : '#CBD5E1',
            }}
          >
            {aiEnabled ? <CheckCircle2 size={13} /> : null}
            <span>{aiEnabled ? 'AI Active' : 'AI Paused'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">AI Persona & Tone</label>
            <select
              value={aiTone}
              onChange={e => setAiTone(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none"
            >
              <option value="executive">Executive & Corporate (Recommended)</option>
              <option value="vip">Luxury & VIP Concierge</option>
              <option value="direct">Direct & High-Conversion Sales</option>
            </select>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Lead Contextualization</label>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI automatically extracts customer requirements, company name, and location to tailor greetings.
            </p>
          </div>
        </div>
      </div>

      {/* Bot Flow Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const cfg = STEP_TYPES.find(s => s.type === step.type) ?? STEP_TYPES[0]
          return (
            <div key={step.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: cfg.color }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-xs text-slate-400">— {cfg.desc}</span>
                  </div>
                  <textarea value={step.message} onChange={e => updateStep(step.id, e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50 resize-none" />
                  {step.options && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {step.options.map((opt, oi) => <span key={oi} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{oi + 1}. {opt}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => removeStep(step.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition flex-shrink-0"><Trash2 size={13} /></button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {STEP_TYPES.map(t => (
          <button key={t.type} onClick={() => addStep(t.type)} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition hover:shadow-sm"
            style={{ borderColor: t.color + '40', color: t.color, background: t.color + '10' }}>
            <Plus size={12} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2"><Zap size={14} style={{ color: '#C9A84C' }} /><span className="text-xs font-semibold text-slate-600">Trigger Rules</span></div>
        <p className="text-xs text-slate-500">AI Auto-Reply triggers instantly on the first incoming customer message. Once staff sends a reply, AI auto-response yields control to the human agent.</p>
      </div>
    </div>
  )
}
