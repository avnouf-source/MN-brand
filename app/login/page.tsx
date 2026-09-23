'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { MNLogo } from '@/components/shared/MNLogo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.ok) {
      router.push('/')
    } else {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FAFAFA' }}>
      {/* Left — Branding Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: '#0F1729' }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <MNLogo size="lg" variant="dark" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white tracking-tight">MN</span>
                <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#C9A84C' }}>Brand</span>
              </div>
              <p className="text-xs font-semibold tracking-widest uppercase opacity-60 text-white mt-0.5">Global CRM</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            International<br />
            <span style={{ color: '#C9A84C' }}>Lead Generation</span><br />
            Platform
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            A VIP-grade WhatsApp CRM built for global teams. Manage leads from any country, communicate via WhatsApp, and close deals faster.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Countries', value: '40+' },
            { label: 'WhatsApp API', value: 'Live' },
            { label: 'Pipeline Stages', value: '4' },
            { label: 'Response Time', value: '< 5s' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-white/30 text-xs">© 2025 MN Brand · All rights reserved</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <MNLogo size="md" variant="dark" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-800">MN</span>
                <span className="text-xl font-extrabold" style={{ color: '#C9A84C' }}>Brand</span>
              </div>
              <p className="text-[9px] font-semibold tracking-widest uppercase text-slate-400 mt-0.5">Global CRM</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your MN Brand workspace</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@mnbrand.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder-slate-400"
                  style={{ '--tw-ring-color': '#C9A84C' } as any}
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 2px #C9A84C40'; e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.boxShadow = ''; e.target.style.borderColor = '#e2e8f0' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none placeholder-slate-400"
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 2px #C9A84C40'; e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.boxShadow = ''; e.target.style.borderColor = '#e2e8f0' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition shadow-sm mt-2"
              style={{ background: loading ? '#a08030' : '#0F1729' }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In to MN Brand'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
