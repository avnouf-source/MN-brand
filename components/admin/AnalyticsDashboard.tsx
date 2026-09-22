'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, MessageCircle, Star, CheckCircle2, ShoppingBag } from 'lucide-react'

interface Props {
  stats: { totalLeads: number; hotLeads: number; openConvs: number; orders: number; closed: number; totalMessages: number }
  agents: { id: string; name: string; status: string; _count: { assignedLeads: number } }[]
  leads: { stage: string; tag: string }[]
}

const KPIS = (stats: Props['stats']) => [
  { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: '#0F1729', bg: '#f1f5f9' },
  { label: 'Hot Leads', value: stats.hotLeads, icon: Star, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Open Chats', value: stats.openConvs, icon: MessageCircle, color: '#10b981', bg: '#f0fdf4' },
  { label: 'Orders Placed', value: stats.orders, icon: ShoppingBag, color: '#C9A84C', bg: '#FDF6E3' },
  { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: '#64748b', bg: '#f8fafc' },
  { label: 'Messages', value: stats.totalMessages, icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
]

const PIPELINE_COLORS = ['#C9A84C', '#0F1729', '#10b981', '#64748b']

export function AnalyticsDashboard({ stats, agents, leads }: Props) {
  const agentData = agents.map(a => ({ name: a.name.split(' ')[0], leads: a._count.assignedLeads, status: a.status }))
  const pipelineData = [
    { name: 'New', value: leads.filter(l => l.stage === 'NEW').length },
    { name: 'Talking', value: leads.filter(l => l.stage === 'TALKING').length },
    { name: 'Order', value: leads.filter(l => l.stage === 'ORDER_PLACED').length },
    { name: 'Done', value: leads.filter(l => l.stage === 'DONE').length },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">MN Brand global CRM overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS(stats).map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: kpi.bg }}>
                <Icon size={16} style={{ color: kpi.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Agent Performance */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Agent Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="leads" fill="#0F1729" radius={[6, 6, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Pipeline Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                {pipelineData.map((_, i) => <Cell key={i} fill={PIPELINE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pipelineData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIPELINE_COLORS[i] }} />
                <span className="text-xs text-slate-500">{d.name}</span>
                <span className="text-xs font-semibold text-slate-700 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Agent Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Agent', 'Status', 'Assigned Leads'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-6 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {agents.map(a => (
                <tr key={a.id}>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0F1729' }}>
                        {a.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-6">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {a.status === 'ONLINE' ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-700">{a._count.assignedLeads}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
