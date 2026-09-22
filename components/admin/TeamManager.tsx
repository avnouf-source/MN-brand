'use client'
import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Key, Loader2 } from 'lucide-react'

interface Agent { id: string; name: string; email: string; department?: string; status: string; _count: { assignedLeads: number } }

export function TeamManager({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'reset' | null>(null)
  const [selected, setSelected] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' })
  const [newPw, setNewPw] = useState('')

  const filtered = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))

  async function handleAdd() {
    setLoading(true)
    const res = await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const a = await res.json(); setAgents(prev => [...prev, { ...a, _count: { assignedLeads: 0 } }]) }
    setModal(null); setForm({ name: '', email: '', department: '', password: '' }); setLoading(false)
  }

  async function handleEdit() {
    if (!selected) return; setLoading(true)
    const res = await fetch('/api/agents', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, ...form }) })
    if (res.ok) { const a = await res.json(); setAgents(prev => prev.map(x => x.id === a.id ? { ...x, ...a } : x)) }
    setModal(null); setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this agent?')) return
    await fetch('/api/agents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setAgents(prev => prev.filter(a => a.id !== id))
  }

  async function handleReset() {
    if (!selected) return; setLoading(true)
    await fetch('/api/agents', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, password: newPw }) })
    setModal(null); setNewPw(''); setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">Team</h1><p className="text-sm text-slate-500 mt-0.5">{agents.length} agents</p></div>
        <button onClick={() => { setForm({ name: '', email: '', department: '', password: '' }); setModal('add') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm" style={{ background: '#0F1729' }}>
          <Plus size={15} /> Add Agent
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            {['Agent', 'Department', 'Status', 'Leads', 'Actions'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/50 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0F1729' }}>{a.name.charAt(0)}</div>
                    <div><p className="font-medium text-slate-800">{a.name}</p><p className="text-xs text-slate-400">{a.email}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{a.department ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {a.status === 'ONLINE' ? '● Online' : '○ Offline'}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-700">{a._count.assignedLeads}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelected(a); setForm({ name: a.name, email: a.email, department: a.department ?? '', password: '' }); setModal('edit') }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"><Pencil size={13} /></button>
                    <button onClick={() => { setSelected(a); setModal('reset') }}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition"><Key size={13} /></button>
                    <button onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{modal === 'add' ? 'Add Agent' : 'Edit Agent'}</h3>
            <div className="space-y-3">
              {[['Name', 'name', 'text', 'Sara Johnson'], ['Email', 'email', 'email', 'sara@company.com'], ['Department', 'department', 'text', 'Sales'], ['Password', 'password', 'password', modal === 'add' ? 'Required' : 'Leave blank to keep']].map(([label, key, type, ph]) => (
                <div key={key as string}><label className="block text-xs font-medium text-slate-600 mb-1">{label as string}</label>
                  <input type={type as string} placeholder={ph as string} value={(form as any)[key as string]}
                    onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50" /></div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={modal === 'add' ? handleAdd : handleEdit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#0F1729' }}>
                {loading && <Loader2 size={13} className="animate-spin" />} {modal === 'add' ? 'Add Agent' : 'Save'}
              </button>
              <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'reset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">New password for {selected?.name}</p>
            <input type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50 mb-4" />
            <div className="flex gap-2">
              <button onClick={handleReset} disabled={!newPw || loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#C9A84C' }}>Reset</button>
              <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
