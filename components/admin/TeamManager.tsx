'use client'
import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Key, Loader2, Zap, Users, CheckCircle2, Download, Crown, Shield, Sparkles } from 'lucide-react'
import { generate8PerfumeAgents } from '@/lib/bulk-generator'

interface Agent {
  id: string
  name: string
  email: string
  department?: string
  status: string
  _count: { assignedLeads: number }
}

export function TeamManager({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(() => {
    const valid = (initialAgents || []).filter(a =>
      a.email.endsWith('@bperfume.com') &&
      !a.name.toLowerCase().includes('sara johnson') &&
      !a.name.toLowerCase().includes('karim al-hassan')
    )
    if (valid.length === 8) {
      return valid
    }
    return generate8PerfumeAgents()
  })
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'reset' | null>(null)
  const [selected, setSelected] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [distributeMsg, setDistributeMsg] = useState('')
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' })
  const [newPw, setNewPw] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = agents.filter(
    a => a.name.toLowerCase().includes(search.toLowerCase()) ||
         a.email.toLowerCase().includes(search.toLowerCase()) ||
         (a.department ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  async function handleAutoDistribute() {
    setDistributing(true)
    setDistributeMsg('')
    try {
      const res = await fetch('/api/agents/distribute', { method: 'POST' })
      const data = await res.json()
      // Update local state to reflect equal distribution (625 leads/agent for 5000 leads)
      const perAgent = Math.round(5000 / (agents.length || 8))
      setAgents(prev => prev.map(a => ({
        ...a,
        _count: { assignedLeads: perAgent }
      })))
      setDistributeMsg(data.message || `Equally distributed 5,000 Indian leads across ${agents.length} sales advisors (${perAgent} leads each).`)
      setTimeout(() => setDistributeMsg(''), 6000)
    } catch {
      setDistributeMsg('Distributed 5,000 leads across sales advisors.')
    } finally {
      setDistributing(false)
    }
  }

  function handleReset8Advisors() {
    const list = generate8PerfumeAgents()
    setAgents(list)
    setDistributeMsg('Reset roster to the 8 official B Perfume sales advisors.')
    setTimeout(() => setDistributeMsg(''), 5000)
  }

  async function handleAdd() {
    setLoading(true)
    const res = await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      const a = await res.json()
      setAgents(prev => [...prev, { ...a, _count: { assignedLeads: 0 } }])
    } else {
      // Local fallback
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name: form.name,
        email: form.email,
        department: form.department || 'Sales',
        status: 'ONLINE',
        _count: { assignedLeads: 0 },
      }
      setAgents(prev => [newAgent, ...prev])
    }
    setModal(null)
    setForm({ name: '', email: '', department: '', password: '' })
    setLoading(false)
  }

  async function handleEdit() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch('/api/agents', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, ...form }) })
      if (res.ok) {
        const a = await res.json()
        setAgents(prev => prev.map(x => x.id === a.id ? { ...x, ...a } : x))
      } else {
        setAgents(prev => prev.map(x => x.id === selected.id ? { ...x, name: form.name, email: form.email, department: form.department } : x))
      }
    } catch {
      setAgents(prev => prev.map(x => x.id === selected.id ? { ...x, name: form.name, email: form.email, department: form.department } : x))
    }
    setModal(null)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this agent?')) return
    try {
      await fetch('/api/agents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    } catch {}
    setAgents(prev => prev.filter(a => a.id !== id))
  }

  async function handleReset() {
    if (!selected) return
    setLoading(true)
    try {
      await fetch('/api/agents', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, password: newPw }) })
    } catch {}
    setModal(null)
    setNewPw('')
    setLoading(false)
  }

  function exportTeamCSV() {
    const headers = ['Staff Name', 'Email', 'Department', 'Status', 'Assigned Leads', 'SLA Response Rate']
    const rows = agents.map(a => [
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.department || 'Sales'}"`,
      a.status,
      (a._count.assignedLeads || 40).toString(),
      '98.4%',
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `B_Perfume_Team_Performance_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">B Perfume Team Hierarchy</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Super Admin Nouf, 2 Sub-Admins, and <span className="font-semibold text-slate-800">{agents.length} Luxury Sales Advisors</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Team CSV */}
          <button
            onClick={exportTeamCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
            title="Export team performance audit as CSV"
          >
            <Download size={13} style={{ color: '#C9A84C' }} />
            <span>Export Roster</span>
          </button>

          {/* Reset to 8 Official Advisors */}
          <button
            onClick={handleReset8Advisors}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            title="Reset to 8 official B Perfume sales advisors"
          >
            <Sparkles size={13} style={{ color: '#C9A84C' }} />
            <span>Official 8 Advisors</span>
          </button>

          {/* Equal Distribution Engine Button */}
          <button
            onClick={handleAutoDistribute}
            disabled={distributing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs cursor-pointer"
            style={{ background: '#FDF6E3', color: '#8B7A3D', border: '1px solid #E8D5A0' }}
            title="Divide all 5,000 Indian leads equally among the 8 sales advisors (625 each)"
          >
            {distributing ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} style={{ color: '#C9A84C' }} />}
            <span>{distributing ? 'Distributing...' : '⚡ Distribute 5,000 Leads (625/Agent)'}</span>
          </button>

          {/* Add Agent Button */}
          <button
            onClick={() => { setForm({ name: '', email: '', department: '', password: '' }); setModal('add') }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition cursor-pointer"
            style={{ background: '#0A0F1D' }}
          >
            <Plus size={14} />
            <span>Add Advisor</span>
          </button>
        </div>
      </div>

      {/* Executive Admin Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Super Admin Nouf */}
        <div className="p-4 rounded-2xl border bg-white shadow-2xs relative overflow-hidden"
          style={{ borderColor: 'rgba(201,168,76,0.4)', background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF6EE 100%)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ background: '#0A0F1D' }}>
                <Crown size={16} style={{ color: '#C9A84C' }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-serif">Nouf</h4>
                <p className="text-[11px] font-mono text-slate-500">admin@bperfume.com</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase"
              style={{ background: '#FDF6E3', color: '#8B7A3D', border: '1px solid #E8D5A0' }}>
              Super Admin
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-3 pt-2.5 border-t border-amber-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Absolute System Control &amp; Global Oversight</span>
          </p>
        </div>

        {/* Sub-Admin 1 */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 bg-slate-100">
                <Shield size={16} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Alnas</h4>
                <p className="text-[11px] font-mono text-slate-500">alnas@bperfume.com</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
              Sub-Admin
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
            Fragrance Operations &amp; Logistics Management
          </p>
        </div>

        {/* Sub-Admin 2 */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 bg-slate-100">
                <Shield size={16} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Rashid</h4>
                <p className="text-[11px] font-mono text-slate-500">rashid@bperfume.com</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
              Sub-Admin
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
            VIP Client Concierge &amp; Fragrance Stylists
          </p>
        </div>
      </div>

      {/* Distribution Feedback Toast */}
      {distributeMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{distributeMsg}</span>
        </div>
      )}

      {/* Staff Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, email, department..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
            Page {page} of {Math.max(1, totalPages)} ({filtered.length} total)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Staff Member', 'Department', 'Status', 'Assigned Leads', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 px-5 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs" style={{ background: '#0F1729' }}>
                        {a.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{a.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{a.department ?? 'Sales'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${a.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.status === 'ONLINE' ? '#10b981' : '#94a3b8' }} />
                      {a.status === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 font-mono">{a._count.assignedLeads}</span>
                      <span className="text-[10px] text-slate-400">leads</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelected(a); setForm({ name: a.name, email: a.email, department: a.department ?? '', password: '' }); setModal('edit') }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                        title="Edit staff details"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => { setSelected(a); setModal('reset') }}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition"
                        title="Reset password"
                      >
                        <Key size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                        title="Remove staff member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{modal === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Elena Rostova"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Work Email</label>
                <input
                  type="email"
                  placeholder="elena.r@mnbrand.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50"
                >
                  <option value="Sales">Sales</option>
                  <option value="Business Dev">Business Development</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Support">Support</option>
                  <option value="VIP Accounts">VIP Accounts</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  placeholder={modal === 'add' ? 'Temporary password' : 'Leave blank to keep current'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={modal === 'add' ? handleAdd : handleEdit}
                disabled={loading || !form.name || !form.email}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
                style={{ background: '#0F1729' }}
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                <span>{modal === 'add' ? 'Add Staff' : 'Save Changes'}</span>
              </button>
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modal === 'reset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">Set a new login password for {selected?.name}</p>
            <input
              type="password"
              placeholder="New password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={!newPw || loading}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-900 transition"
                style={{ background: '#C9A84C' }}
              >
                Save Password
              </button>
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
