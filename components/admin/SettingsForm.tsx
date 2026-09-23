'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, CheckCircle2, AlertCircle, Palette, Database, Globe, Sliders } from 'lucide-react'

interface Config {
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  businessAccountId: string
}

interface BrandTheme {
  brandName: string
  primaryColor: string
  accentColor: string
}

const PRESET_PALETTES = [
  { name: 'Royal Navy & Gold (Default)', primary: '#0F1729', accent: '#C9A84C' },
  { name: 'Emerald & Platinum', primary: '#062c21', accent: '#10b981' },
  { name: 'Midnight Violet & Amber', primary: '#0f0c29', accent: '#f59e0b' },
  { name: 'Obsidian & Rose Gold', primary: '#18181b', accent: '#f43f5e' },
  { name: 'Nordic Slate & Cyan', primary: '#0f172a', accent: '#06b6d4' },
]

export function SettingsForm({ initialConfig }: { initialConfig: Config | null }) {
  const [tab, setTab] = useState<'whatsapp' | 'branding' | 'database'>('branding')
  const [form, setForm] = useState<Config>(
    initialConfig ?? {
      phoneNumberId: '',
      accessToken: '',
      webhookVerifyToken: 'mnbrand-webhook-verify-2024',
      businessAccountId: '',
    }
  )
  const [theme, setTheme] = useState<BrandTheme>({
    brandName: 'MN Brand',
    primaryColor: '#0F1729',
    accentColor: '#C9A84C',
  })
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)
  const [themeSaved, setThemeSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('mn_brand_theme')
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme)
        setTheme(parsed)
      }
    } catch {}
  }, [])

  function applyTheme(newTheme: BrandTheme) {
    setTheme(newTheme)
    document.documentElement.style.setProperty('--mn-navy', newTheme.primaryColor)
    document.documentElement.style.setProperty('--mn-gold', newTheme.accentColor)
    try {
      localStorage.setItem('mn_brand_theme', JSON.stringify(newTheme))
      window.dispatchEvent(new CustomEvent('mn:theme-changed', { detail: newTheme }))
      setThemeSaved(true)
      setTimeout(() => setThemeSaved(false), 2500)
    } catch {}
  }

  async function saveConfig() {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {}
    finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '123456789012345', help: 'Meta > WhatsApp > API Setup' },
    { key: 'businessAccountId', label: 'Business Account ID', placeholder: '987654321098765', help: 'Your Meta Business Account ID' },
    { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'your-secret-token', help: 'Same token in Meta webhook config' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">System & Brand Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Customize global branding, WhatsApp API credentials, and cloud database storage.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setTab('branding')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 ${
            tab === 'branding'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Palette size={15} style={{ color: tab === 'branding' ? '#C9A84C' : undefined }} />
          <span>Dynamic Theming & Branding</span>
        </button>

        <button
          onClick={() => setTab('whatsapp')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 ${
            tab === 'whatsapp'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Globe size={15} style={{ color: tab === 'whatsapp' ? '#C9A84C' : undefined }} />
          <span>WhatsApp Cloud API</span>
        </button>

        <button
          onClick={() => setTab('database')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 ${
            tab === 'database'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Database size={15} style={{ color: tab === 'database' ? '#C9A84C' : undefined }} />
          <span>Cloud Database (PostgreSQL)</span>
        </button>
      </div>

      {/* TAB 1: Dynamic Theming & Branding */}
      {tab === 'branding' && (
        <div className="space-y-6">
          {themeSaved && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={15} /> Brand theme and dynamic color variables updated successfully!
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders size={16} style={{ color: '#C9A84C' }} /> Brand Identity & Palette
            </h3>

            {/* Brand Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Brand Organization Name</label>
              <input
                value={theme.brandName}
                onChange={e => setTheme({ ...theme, brandName: e.target.value })}
                placeholder="e.g. MN Brand, Apex Global"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#C9A84C' } as any}
              />
              <p className="text-[11px] text-slate-400 mt-1">Displayed in top navigation bars, PWA manifests, and outgoing system messages.</p>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Primary Navy Color */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Primary Brand Color (--mn-navy)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={e => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={e => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Used for sidebars, primary buttons, and headers.</p>
              </div>

              {/* Secondary Gold Color */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Secondary Accent Color (--mn-gold)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={e => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={theme.accentColor}
                    onChange={e => setTheme({ ...theme, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Used for badges, highlights, icons, and CTAs.</p>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Luxury International Presets</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_PALETTES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTheme({ ...theme, primaryColor: p.primary, accentColor: p.accent })}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-left transition bg-white"
                  >
                    <span className="text-xs font-medium text-slate-700">{p.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md border border-slate-200" style={{ background: p.primary }} />
                      <span className="w-5 h-5 rounded-md border border-slate-200" style={{ background: p.accent }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview & Apply */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                  style={{ background: theme.primaryColor }}
                >
                  {theme.brandName}
                </div>
                <div
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold"
                  style={{ background: `${theme.accentColor}25`, color: theme.accentColor }}
                >
                  Accent Live Preview
                </div>
              </div>

              <button
                type="button"
                onClick={() => applyTheme(theme)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition active:scale-95 shadow-xs"
                style={{ background: theme.primaryColor }}
              >
                <Save size={13} style={{ color: theme.accentColor }} />
                <span>Apply & Save Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WhatsApp Cloud API */}
      {tab === 'whatsapp' && (
        <div className="space-y-6">
          {saved && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-600">
              <CheckCircle2 size={15} /> WhatsApp Cloud API credentials saved successfully!
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                <input
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2"
                />
                <p className="text-xs text-slate-400 mt-1">{f.help}</p>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={form.accessToken}
                  onChange={e => setForm({ ...form, accessToken: e.target.value })}
                  placeholder="EAAxxxxxxxxx..."
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={saveConfig}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs transition"
                style={{ background: '#0F1729' }}
              >
                <Save size={14} /> {loading ? 'Saving...' : 'Save WhatsApp Settings'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} style={{ color: '#C9A84C' }} />
              <h3 className="text-sm font-semibold text-slate-700">Webhook Setup Instructions</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>1. Meta Business Manager → WhatsApp → Configuration</p>
              <p>
                2. Callback URL:{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">https://yourdomain.com/api/webhook</code>
              </p>
              <p>3. Verify Token: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{form.webhookVerifyToken}</code></p>
              <p>4. Webhook Event Fields: Subscribe to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">messages</code></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cloud Database (PostgreSQL / Supabase) */}
      {tab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Database size={18} style={{ color: '#C9A84C' }} />
              <h3 className="text-base font-bold text-slate-900">Production Cloud PostgreSQL Setup</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Netlify serverless functions have a read-only, ephemeral filesystem where SQLite files (<code className="bg-slate-100 px-1 rounded text-xs">dev.db</code>) reset on redeploys. To make all 2,000+ leads, 50 staff accounts, and conversations permanent in production, connect a free Cloud PostgreSQL instance (such as <strong>Supabase</strong> or <strong>Neon</strong>).
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="font-semibold text-slate-700">Prisma PostgreSQL Connection Format:</div>
              <div className="text-amber-800 break-all select-all">
                postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Quick 3-Step Production Activation:</p>
              <p>1. Create a free PostgreSQL database at <strong>Supabase.com</strong> or <strong>Neon.tech</strong>.</p>
              <p>2. In your <strong>Netlify Dashboard</strong> → Site Settings → Environment Variables, set:</p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-700">
                <li>DATABASE_URL = &quot;postgresql://...&quot;</li>
                <li>NEXTAUTH_SECRET = &quot;mnbrand-production-secret-2024&quot;</li>
                <li>NEXTAUTH_URL = &quot;https://your-netlify-site.netlify.app&quot;</li>
              </ul>
              <p>3. Run <code className="bg-slate-100 px-1 rounded">npx prisma db push</code> or seed via <code className="bg-slate-100 px-1 rounded">/api/leads/seed-bulk</code>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
