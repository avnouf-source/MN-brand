'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

// All 11 officially seeded B Perfume team accounts
const SEEDED_TEAM_ACCOUNTS = [
  // Super Admin
  {
    roleCategory: 'Super Admin',
    name: 'Nouf',
    email: 'admin@bperfume.com',
    password: 'Nouf1234',
    role: 'ADMIN',
    destination: 'Executive Dashboard',
    path: '/admin/dashboard',
  },
  // Sub-Admins (2)
  {
    roleCategory: 'Sub-Admin',
    name: 'Alnas',
    email: 'alnas@bperfume.com',
    password: 'Alnas1234',
    role: 'SUB_ADMIN',
    destination: 'Executive Dashboard',
    path: '/admin/dashboard',
  },
  {
    roleCategory: 'Sub-Admin',
    name: 'Rashid',
    email: 'rashid@bperfume.com',
    password: 'Rashid1234',
    role: 'SUB_ADMIN',
    destination: 'Executive Dashboard',
    path: '/admin/dashboard',
  },
  // 8 Sales Agents
  {
    roleCategory: 'Sales Agent',
    name: 'Adarsh',
    email: 'adarsh@bperfume.com',
    password: 'Adarsh0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Fathimath Shifa',
    email: 'fathimathshifa@bperfume.com',
    password: 'FathimathShifa0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Nandana',
    email: 'nandana@bperfume.com',
    password: 'Nandana0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Nouf',
    email: 'nouf@bperfume.com',
    password: 'Nouf0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Rizvan',
    email: 'rizvan@bperfume.com',
    password: 'Rizvan0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Sajila',
    email: 'sajila@bperfume.com',
    password: 'Sajila0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Sajna',
    email: 'sajna@bperfume.com',
    password: 'Sajna0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
  {
    roleCategory: 'Sales Agent',
    name: 'Salih',
    email: 'salih@bperfume.com',
    password: 'Salih0000',
    role: 'AGENT',
    destination: 'Clean Chat Window',
    path: '/agent/workspace',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ title?: string; message: string; isCaseError?: boolean } | null>(null)
  const [showDirectory, setShowDirectory] = useState(false)
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADMIN' | 'AGENT'>('ALL')

  function handleQuickFill(acc: typeof SEEDED_TEAM_ACCOUNTS[0]) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanEmail = email.toLowerCase().trim()
    const cleanPassword = password.trim()

    // 1. Client-Side Case-Sensitivity Smart Verification
    const matchingAccount = SEEDED_TEAM_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === cleanEmail
    )

    if (matchingAccount) {
      if (
        cleanPassword.toLowerCase() === matchingAccount.password.toLowerCase() &&
        cleanPassword !== matchingAccount.password
      ) {
        setError({
          title: 'Case-Sensitive Password Mismatch',
          message: `Passwords are case-sensitive (e.g. '${matchingAccount.password}' with a capital '${matchingAccount.password[0]}'). Please check your uppercase and lowercase letters.`,
          isCaseError: true,
        })
        setLoading(false)
        return
      }
    }

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
        const expectedHint = result.error.split(':')[1] || (matchingAccount ? matchingAccount.password : 'Password')
        setError({
          title: 'Case-Sensitive Password Mismatch',
          message: `Passwords are case-sensitive (e.g. '${expectedHint}' with a capital '${expectedHint[0]}'). Please check your uppercase and lowercase letters.`,
          isCaseError: true,
        })
      } else {
        // Fallback check against known list
        if (matchingAccount && cleanPassword.toLowerCase() === matchingAccount.password.toLowerCase()) {
          setError({
            title: 'Case-Sensitive Password Mismatch',
            message: `Passwords are case-sensitive (e.g. '${matchingAccount.password}' with a capital '${matchingAccount.password[0]}'). Please check your uppercase and lowercase letters.`,
            isCaseError: true,
          })
        } else {
          setError({
            title: 'Authentication Failed',
            message: 'Invalid official email or security password. Please verify your credentials and try again.',
            isCaseError: false,
          })
        }
      }
    } catch (err: any) {
      setError({
        title: 'Connection Error',
        message: 'Could not connect to authentication service. Please check your connection.',
        isCaseError: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = SEEDED_TEAM_ACCOUNTS.filter(acc => {
    if (activeTab === 'ADMIN') return acc.role === 'ADMIN' || acc.role === 'SUB_ADMIN'
    if (activeTab === 'AGENT') return acc.role === 'AGENT'
    return true
  })

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
            <span>Encrypted CRM Authentication</span>
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
              Access your executive portal or advisor communication hub.
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

          {/* Form */}
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
                  placeholder="admin@bperfume.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700/80 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition"
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
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-zinc-700/80 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition font-mono tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-1"
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
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Team Access Directory Toggle */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowDirectory(!showDirectory)}
              className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-white transition py-1"
            >
              <span className="flex items-center gap-2 font-medium">
                <Users size={14} className="text-zinc-400" />
                <span>Quick Team Directory (11 Accounts)</span>
              </span>
              {showDirectory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Quick Fill Dropdown List */}
            {showDirectory && (
              <div className="mt-3 space-y-3 pt-2">
                {/* Tabs */}
                <div className="flex gap-1.5 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px]">
                  {(['ALL', 'ADMIN', 'AGENT'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1 rounded-md font-semibold transition ${
                        activeTab === tab
                          ? 'bg-zinc-700 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab === 'ALL' ? 'All (11)' : tab === 'ADMIN' ? 'Leadership (3)' : 'Agents (8)'}
                    </button>
                  ))}
                </div>

                {/* Team member accounts list */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {filteredAccounts.map(acc => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className="w-full text-left p-2.5 rounded-lg border border-zinc-800/80 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800/60 transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white truncate">{acc.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                              acc.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : acc.role === 'SUB_ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {acc.roleCategory}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">{acc.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-zinc-400 group-hover:text-white group-hover:underline">
                          Auto Fill →
                        </span>
                        <p className="text-[9px] text-zinc-500 truncate">{acc.destination}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monochromatic Footer Info */}
        <div className="text-center text-[11px] text-zinc-500 space-y-1">
          <p>© 2025 B Perfume International · Encrypted Communication Gateway</p>
          <p className="text-[10px] text-zinc-600">
            Admins route to Executive Dashboard · Advisors route to Native Clean Chat
          </p>
        </div>
      </div>
    </div>
  )
}
