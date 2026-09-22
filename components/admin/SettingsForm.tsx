'use client'
import { useState } from 'react'
import { Eye, EyeOff, Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface Config { phoneNumberId: string; accessToken: string; webhookVerifyToken: string; businessAccountId: string }

export function SettingsForm({ initialConfig }: { initialConfig: Config | null }) {
  const [form, setForm] = useState<Config>(initialConfig ?? { phoneNumberId: '', accessToken: '', webhookVerifyToken: 'mnbrand-webhook-verify-2024', businessAccountId: '' })
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  const fields = [
    { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '123456789012345', help: 'Meta > WhatsApp > API Setup' },
    { key: 'businessAccountId', label: 'Business Account ID', placeholder: '987654321098765', help: 'Your Meta Business Account ID' },
    { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'your-secret-token', help: 'Same token in Meta webhook config' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-xl font-bold text-slate-900">WhatsApp Settings</h1><p className="text-sm text-slate-500 mt-0.5">Cloud API credentials</p></div>

      {saved && <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-600"><CheckCircle2 size={15} /> Saved!</div>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        {fields.map(f => (
          <div key={f.key}><label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
            <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2" />
            <p className="text-xs text-slate-400 mt-1">{f.help}</p></div>
        ))}
        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Access Token</label>
          <div className="relative">
            <input type={showToken ? 'text' : 'password'} value={form.accessToken} onChange={e => setForm({ ...form, accessToken: e.target.value })} placeholder="EAAxxxxxxxxx..."
              className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2" />
            <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showToken ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div></div>
        <div className="pt-2"><button onClick={save} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#0F1729' }}>
          <Save size={14} /> {loading ? 'Saving...' : 'Save Settings'}</button></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3"><AlertCircle size={14} style={{ color: '#C9A84C' }} /><h3 className="text-sm font-semibold text-slate-700">Webhook Setup</h3></div>
        <div className="space-y-2 text-sm text-slate-600">
          <p>1. Meta Business Manager → WhatsApp → Configuration</p>
          <p>2. Callback URL: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">https://yourdomain.com/api/webhook</code></p>
          <p>3. Verify Token: match value above</p>
          <p>4. Subscribe: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">messages</code></p>
        </div>
      </div>
    </div>
  )
}
