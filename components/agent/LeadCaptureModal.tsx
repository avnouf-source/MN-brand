'use client'
import { useState } from 'react'
import { X, User, Loader2, Briefcase, Globe } from 'lucide-react'
import { PhoneInput } from '@/components/shared/PhoneInput'

const SOURCES = ['LinkedIn', 'WhatsApp', 'Instagram', 'Website', 'Referral', 'TikTok', 'Other']

interface Props {
  agents: { id: string; name: string }[]
  onClose: () => void
  onSaved: (lead: any) => void
  initialPhone?: string
}

export function LeadCaptureModal({ agents, onClose, onSaved, initialPhone }: Props) {
  const [form, setForm] = useState({
    name: '', phone: initialPhone || '+971', email: '', company: '',
    businessRequirement: '', source: 'LinkedIn',
    assignedAgentId: agents[0]?.id ?? '', tag: 'HOT',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    if (form.phone.length < 8) { setError('Please enter a valid phone number'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email || undefined, company: form.company || undefined, businessRequirement: form.businessRequirement || undefined, leadSource: form.source, tag: form.tag, assignedAgentId: form.assignedAgentId || undefined }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save') }
      else { onSaved(await res.json()); onClose() }
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  const tags = [
    { value: 'HOT', label: '🔥 Hot', cls: 'bg-red-50 border-red-200 text-red-600' },
    { value: 'WARM', label: '☀️ Warm', cls: 'bg-amber-50 border-amber-200 text-amber-600' },
    { value: 'COLD', label: '❄️ Cold', cls: 'bg-blue-50 border-blue-200 text-blue-600' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FDF6E3' }}>
              <User size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">New Lead</h2>
              <p className="text-xs text-slate-400">Capture a new international lead</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition"><X size={16} className="text-slate-500" /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="James Mitchell"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 placeholder-slate-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Number <span className="text-red-400">*</span></label>
            <PhoneInput value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="50 123 4567" />
            <p className="text-xs text-slate-400 mt-1">International number with country code</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="james@company.com (optional)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 placeholder-slate-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5"><span className="flex items-center gap-1.5"><Briefcase size={13} style={{ color: '#C9A84C' }} />Company Name</span></label>
            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Mitchell & Co"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 placeholder-slate-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5"><span className="flex items-center gap-1.5"><Globe size={13} style={{ color: '#C9A84C' }} />Business Requirements</span></label>
            <textarea value={form.businessRequirement} onChange={e => setForm({ ...form, businessRequirement: e.target.value })} rows={3}
              placeholder="Lead generation for UK property market..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 placeholder-slate-400 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Source</label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, source: s })}
                  className="px-3 py-1.5 rounded-full border text-xs font-medium transition"
                  style={{ background: form.source === s ? '#0F1729' : '#fff', color: form.source === s ? '#fff' : '#64748b', borderColor: form.source === s ? '#0F1729' : '#e2e8f0' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {tags.map(t => (
                <button key={t.value} type="button" onClick={() => setForm({ ...form, tag: t.value })}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium text-center transition ${form.tag === t.value ? t.cls : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {agents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
              <select value={form.assignedAgentId} onChange={e => setForm({ ...form, assignedAgentId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2">
                <option value="">Auto-assign</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-60 shadow-sm"
              style={{ background: '#0F1729' }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving...' : 'Add Lead'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
