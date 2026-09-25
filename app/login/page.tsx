'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react'
import { BPerfumeLogo, BPerfumeWordmark } from '@/components/shared/BPerfumeLogo'

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
      setError('Invalid luxury clienteling credentials. Please check your email and password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FBF9F5' }}>
      {/* Left — High-End Haute Parfumerie Editorial Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[460px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: '#0A0F1D' }}
      >
        {/* Subtle Luxury Gold Background Glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: '#C9A84C' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ background: '#C9A84C' }}
        />

        {/* Brand Crest & Monogram */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-14">
            <BPerfumeLogo size="lg" variant="dark" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-widest font-serif">B PERFUME</span>
              </div>
              <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-amber-300/80 mt-0.5">
                Haute Parfumerie · Paris &amp; Dubai
              </p>
            </div>
          </div>

          {/* Editorial Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
              style={{ background: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.35)', color: '#E8D5A0' }}>
              <Sparkles size={11} style={{ color: '#C9A84C' }} />
              <span>International Luxury Clienteling</span>
            </div>

            <h1 className="text-3xl font-serif font-medium text-white leading-tight">
              Crafting Timeless<br />
              <span style={{ color: '#C9A84C' }}>Olfactory Journeys</span><br />
              Across the Globe.
            </h1>

            <p className="text-white/60 text-sm leading-relaxed font-light">
              The exclusive client communication suite for B Perfume advisors. Managing bespoke consultations, 12-hour Extrait orders, and VIP clienteling across India and international markets.
            </p>
          </div>
        </div>

        {/* Perfume Signature Stats */}
        <div className="grid grid-cols-2 gap-3.5 relative z-10 my-8">
          {[
            { label: 'Signature Extrait', value: 'CITYMAN', sub: '12h Long-Lasting' },
            { label: 'Client Portfolio', value: '5,000+', sub: 'Indian High-Net-Worth' },
            { label: 'Luxury Advisors', value: '8 Agents', sub: 'Dedicated Curation' },
            { label: 'Client Concierge', value: '24/7 VIP', sub: 'WhatsApp First' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl p-3.5 transition backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(201,168,76,0.22)',
              }}
            >
              <p className="text-xs font-semibold text-white/50">{s.label}</p>
              <p className="text-lg font-bold mt-0.5 font-serif" style={{ color: '#C9A84C' }}>{s.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/30 pt-4 border-t border-white/10 font-light">
          <span>© 2025 B Perfume International</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} style={{ color: '#C9A84C' }} /> Encrypted CRM</span>
        </div>
      </div>

      {/* Right — Refined Minimalist Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Brand Crest */}
          <div className="lg:hidden flex flex-col items-center text-center gap-2 mb-6">
            <BPerfumeLogo size="lg" variant="light" />
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-wider">B PERFUME</h2>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-700 mt-0.5">
                Haute Parfumerie Clienteling
              </p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 tracking-tight">Advisor Sign In</h2>
            <p className="text-slate-500 text-xs">Access your personalized luxury consultation workspace</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@bperfume.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition bg-white shadow-2xs"
                  style={{ '--tw-ring-color': '#C9A84C' } as any}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition bg-white shadow-2xs"
                  style={{ '--tw-ring-color': '#C9A84C' } as any}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-xs font-semibold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #0A0F1D 0%, #161F36 100%)',
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                  <span>Authenticating Advisor...</span>
                </>
              ) : (
                <span>Open Luxury Workspace</span>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 font-light flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-amber-600" />
              <span>Restricted to Authorized B Perfume Staff</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
