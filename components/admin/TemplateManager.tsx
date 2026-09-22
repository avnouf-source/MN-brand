'use client'
import { useState } from 'react'
import { Plus, Send } from 'lucide-react'

interface Template { id: string; name: string; body: string; category: string; status: string }

const STATUS_STYLE: Record<string, string> = { APPROVED: 'bg-emerald-50 text-emerald-600', PENDING: 'bg-amber-50 text-amber-600', REJECTED: 'bg-red-50 text-red-500' }

export function TemplateManager({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', body: '', category: 'MARKETING' })
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    const res = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const t = await res.json(); setTemplates(prev => [t, ...prev]) }
    setShowForm(false); setForm({ name: '', body: '', category: 'MARKETING' }); setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">Templates</h1><p className="text-sm text-slate-500 mt-0.5">WhatsApp approved message templates</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#0F1729' }}><Plus size={15} /> New</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Submit for Approval</h3>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-slate-600 mb-1 block">Template Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="welcome_message"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-1 block">Body — use {'{{1}}'} for variables</label>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={3} placeholder="Hi {{1}}, welcome to MN Brand..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 resize-none" /></div>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50">
              <option value="MARKETING">Marketing</option><option value="UTILITY">Utility</option><option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={submit} disabled={loading || !form.name || !form.body} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#C9A84C' }}>Submit</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-slate-800 font-mono">{t.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500">{t.category}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.body}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[t.status] ?? 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
                {t.status === 'APPROVED' && <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ background: '#10b981' }}><Send size={11} /> Broadcast</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
