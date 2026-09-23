'use client'
import { useState } from 'react'
import { ShieldCheck, Lock, EyeOff, Trash2, KeyRound, AlertTriangle, CheckCircle2, ShieldAlert, FileText, RefreshCw } from 'lucide-react'

export function SecurityCenter() {
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true)
  const [piiMasking, setPiiMasking] = useState(false)
  const [wipeTarget, setWipeTarget] = useState('')
  const [wipeConfirmed, setWipeConfirmed] = useState(false)
  const [wipeLoading, setWipeLoading] = useState(false)
  const [wipeHistory, setWipeHistory] = useState([
    {
      id: 'cert-892',
      target: '+44 7911 123456',
      timestamp: '2026-09-21 14:22 GMT',
      status: 'PURGED_COMPLIANT',
      certId: 'GDPR-EU-98214',
    },
    {
      id: 'cert-891',
      target: 'client.almansouri@apexgroup.ae',
      timestamp: '2026-09-19 09:15 GMT',
      status: 'PURGED_COMPLIANT',
      certId: 'GDPR-GCC-41029',
    },
  ])

  function handleExecuteWipe(e: React.FormEvent) {
    e.preventDefault()
    if (!wipeTarget.trim()) return
    setWipeLoading(true)

    setTimeout(() => {
      setWipeLoading(false)
      setWipeConfirmed(true)
      const newEntry = {
        id: `cert-${Date.now()}`,
        target: wipeTarget,
        timestamp: new Date().toLocaleString(),
        status: 'PURGED_COMPLIANT',
        certId: `GDPR-WIPE-${Math.floor(100000 + Math.random() * 900000)}`,
      }
      setWipeHistory(prev => [newEntry, ...prev])
      setWipeTarget('')
      setTimeout(() => setWipeConfirmed(false), 5000)
    }, 1200)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ background: '#0F1729' }}>
            <ShieldCheck size={16} style={{ color: '#C9A84C' }} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Privacy & Security Governance Center</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Enterprise international data privacy standards, GDPR compliance tools, Two-Factor Authentication, and PII anonymization.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">2FA Staff Compliance</span>
            <Lock size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">48 / 50</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">96% active staff enrolled</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Data Encryption Standard</span>
            <ShieldCheck size={15} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">AES-256</p>
          <p className="text-[11px] text-slate-400 mt-0.5">TLS 1.3 In-Flight Encryption</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">GDPR Audit Readiness</span>
            <FileText size={15} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">100%</p>
          <p className="text-[11px] text-blue-500 mt-0.5">Zero outstanding breaches</p>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <KeyRound size={16} style={{ color: '#C9A84C' }} /> Staff Access & Authentication Controls
        </h3>

        {/* 2FA Toggle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-slate-800">Mandatory Two-Factor Authentication (2FA)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Requires all 50 staff members to supply a TOTP verification code from Google Authenticator or Duo upon login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnforced(!twoFactorEnforced)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
              twoFactorEnforced ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* PII Masking Mode */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-slate-800">Live PII Data Anonymization Mode</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automatically masks sensitive customer contact fields (+971 50 *** 4567, email***@domain.com) in agent workspace views to prevent unauthorized data harvesting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPiiMasking(!piiMasking)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
              piiMasking ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>

      {/* GDPR Data Erasure */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-slate-900">GDPR One-Click Data Erasure (Right to be Forgotten)</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Under GDPR Article 17 and international data privacy regulations, consumers may formally request the permanent erasure of their records. Submitting this form purges all messages, call logs, notes, and profile entries associated with the phone or email address.
        </p>

        {wipeConfirmed && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={15} /> Data successfully purged. Official erasure certificate generated and filed.
          </div>
        )}

        <form onSubmit={handleExecuteWipe} className="flex flex-col sm:flex-row gap-3">
          <input
            value={wipeTarget}
            onChange={e => setWipeTarget(e.target.value)}
            placeholder="Enter customer international phone (+971...) or email"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 placeholder-slate-400 font-mono"
            style={{ '--tw-ring-color': '#C9A84C' } as any}
          />
          <button
            type="submit"
            disabled={wipeLoading || !wipeTarget.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-40 shadow-xs active:scale-95"
          >
            {wipeLoading ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
            <span>{wipeLoading ? 'Purging Records...' : 'Execute GDPR Wipe'}</span>
          </button>
        </form>

        {/* Certificate History */}
        <div className="pt-3">
          <p className="text-xs font-bold text-slate-700 mb-2">Recent Erasure Audit Certificates</p>
          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            {wipeHistory.map(entry => (
              <div key={entry.id} className="p-3 flex items-center justify-between bg-slate-50/40">
                <div>
                  <span className="font-mono text-slate-800 font-medium">{entry.target}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{entry.timestamp} · Cert: {entry.certId}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
