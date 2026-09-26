'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ title?: string; message: string; isCaseError?: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanEmail = email.toLowerCase().trim()
    const cleanPassword = password.trim()

    try {
      const result = await signIn('credentials', {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
      })

      if (result?.ok) {
        // Determine role destination
        const isAdminOrSub =
          cleanEmail === 'admin@bperfume.com' ||
          cleanEmail === 'alnas@bperfume.com' ||
          cleanEmail === 'rashid@bperfume.com'

        const destination = isAdminOrSub ? '/admin/dashboard' : '/agent/workspace'
        window.location.href = destination
        return
      }

      // Check if server flagged case-sensitivity
      if (result?.error && result.error.includes('PASSWORD_CASE_SENSITIVE')) {
        const expectedHint = result.error.split(':')[1] || 'Password'
        setError({
          title: 'Case-Sensitive Password Mismatch',
          message: `Passwords are strictly case-sensitive (e.g. starting with uppercase '${expectedHint[0]}'). Please verify your capitalization.`,
          isCaseError: true,
        })
      } else {
        setError({
          title: 'Authentication Failed',
          message: 'Invalid official email address or security password. Please re-enter your credentials.',
          isCaseError: false,
        })
      }
    } catch (err: any) {
      setError({
        title: 'Connection Error',
        message: 'Could not connect to authentication gateway. Please verify your connection.',
        isCaseError: false,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10" style={{ background: '#090A0F' }}>
      {/* Subtle Monochromatic Grid / Glow Backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase border border-white/10 bg-white/5 text-zinc-300">
            <ShieldCheck size={12} className="text-zinc-300" />
            <span>Encrypted CRM Gateway</span>
          </div>
          <h1
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
            className="text-3xl sm:text-4xl font-semibold text-white tracking-wider pt-1"
          >
            B Perfume
          </h1>
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-400">
            Haute Parfumerie · Client Access
          </p>
        </div>

        {/* Monochromatic Login Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-white/10 shadow-2xl relative"
          style={{ background: 'rgba(18, 19, 26, 0.85)' }}
        >
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-medium text-white tracking-tight">Sign In</h2>
            <p className="text-xs text-zinc-400">
              Enter your official credentials to access your secure workspace.
            </p>
          </div>

          {/* Smart Error Handling Banner */}
          {error && (
            <div
              className={`mb-5 p-4 rounded-xl border text-xs flex gap-3 items-start transition-all animate-in fade-in ${
                error.isCaseError
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-red-500/10 border-red-500/30 text-red-200'
              }`}
            >
              <AlertCircle size={16} className={`flex-shrink-0 mt-0.5 ${error.isCaseError ? 'text-amber-400' : 'text-red-400'}`} />
              <div className="space-y-1">
                {error.title && <p className="font-semibold text-white">{error.title}</p>}
                <p className="leading-relaxed opacity-95">{error.message}</p>
              </div>
            </div>
          )}

          {/* Form: STRICTLY Email, Password, and Submit */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Official Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Official Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="name@bperfume.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700/80 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition"
                />
              </div>
            </div>

            {/* Field 2: Security Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Security Password
                </label>
                <span className="text-[10px] text-zinc-400">Case-sensitive</span>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-zinc-700/80 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition font-mono tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-black bg-white hover:bg-zinc-200 active:scale-[0.99] font-medium text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin text-black" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Monochromatic Footer Info */}
        <div className="text-center text-[11px] text-zinc-500 space-y-1">
          <p>© 2025 B Perfume Haute Parfumerie · Encrypted Access</p>
          <p className="text-[10px] text-zinc-600">
            Super Admin &amp; Sub-Admins route to Executive Dashboard · Advisors route to Native Clean Chat
          </p>
        </div>
      </div>
    </div>
  )
}
