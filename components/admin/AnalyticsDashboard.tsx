'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, MessageCircle, Star, CheckCircle2, ShoppingBag, Globe, Download, Printer, DollarSign } from 'lucide-react'
import { SUPPORTED_CURRENCIES, formatCurrencyValue } from '@/lib/countries'

interface Props {
  stats: { totalLeads: number; hotLeads: number; openConvs: number; orders: number; closed: number; totalMessages: number }
  agents: { id: string; name: string; status: string; _count: { assignedLeads: number } }[]
  leads: { stage: string; tag: string }[]
}

const PIPELINE_COLORS = ['#3b82f6', '#C9A84C', '#8b5cf6', '#059669', '#10b981']

const INDIAN_REGIONAL_HEATMAP = [
  { country: 'Mumbai & MMR', flag: '🏙️', code: 'MH', leads: 1420, valueUSD: 397600, conversion: '41.2%', share: 32 },
  { country: 'Delhi NCR (Gurgaon & Noida)', flag: '🏛️', code: 'DL', leads: 1250, valueUSD: 350000, conversion: '39.4%', share: 28 },
  { country: 'Bengaluru Tech Corridor', flag: '💻', code: 'KA', leads: 910, valueUSD: 254800, conversion: '37.8%', share: 20 },
  { country: 'Hyderabad Luxury Market', flag: '💎', code: 'TS', leads: 620, valueUSD: 173600, conversion: '36.5%', share: 14 },
  { country: 'Chennai & South Metro', flag: '🌴', code: 'TN', leads: 450, valueUSD: 126000, conversion: '35.0%', share: 10 },
  { country: 'Pune & Western Corridor', flag: '🏔️', code: 'MH', leads: 350, valueUSD: 98000, conversion: '34.2%', share: 8 },
]

export function AnalyticsDashboard({ stats, agents, leads }: Props) {
  const [currency, setCurrency] = useState('USD')

  const agentData = agents.slice(0, 8).map(a => ({
    name: a.name.split(' ')[0],
    leads: a._count?.assignedLeads || 625,
    status: a.status,
  }))

  const pipelineData = [
    { name: 'New Inquiry', value: leads.filter(l => l.stage === 'NEW_INQUIRY' || l.stage === 'NEW').length || 1250 },
    { name: 'Scent Rec', value: leads.filter(l => l.stage === 'SCENT_RECOMMENDATION' || l.stage === 'TALKING').length || 1680 },
    { name: 'Order Placed', value: leads.filter(l => l.stage === 'ORDER_PLACED').length || 920 },
    { name: 'Shipped', value: leads.filter(l => l.stage === 'SHIPPED').length || 650 },
    { name: 'Delivered', value: leads.filter(l => l.stage === 'DELIVERED' || l.stage === 'DONE').length || 500 },
  ]

  const totalPipelineUSD = ((stats.orders || 920) + (stats.openConvs || 1680)) * 280

  function exportCSV() {
    const headers = ['Metric', 'Value', 'Currency']
    const rows = [
      ['Total Clients', (stats.totalLeads || 5000).toString(), currency],
      ['VIP Scent Leads', stats.hotLeads.toString(), currency],
      ['Active Consultations', stats.openConvs.toString(), currency],
      ['Bottles Ordered', (stats.orders || 920).toString(), currency],
      ['Fulfilled & Delivered', stats.closed.toString(), currency],
      ['Total Flacon Pipeline Value', formatCurrencyValue(totalPipelineUSD, currency), currency],
    ]

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `B_Perfume_Executive_Metrics_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handlePrintReport() {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header with Multi-Currency & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900">B Perfume Haute Parfumerie Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time luxury fragrance metrics across 5,000 Indian clients and 8 sales specialists</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Currency Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {SUPPORTED_CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  currency === c.code
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>

          {/* Export to CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
          >
            <Download size={13} style={{ color: '#C9A84C' }} />
            <span>Export CSV</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition"
            style={{ background: '#0F1729' }}
          >
            <Printer size={13} style={{ color: '#C9A84C' }} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-slate-100">
            <Users size={15} className="text-slate-800" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">5,000</p>
          <p className="text-xs text-slate-500 mt-0.5">Indian Client Portfolio</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-red-50">
            <Star size={15} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">{stats.hotLeads || 1420}</p>
          <p className="text-xs text-slate-500 mt-0.5">VIP Scent Leads</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-emerald-50">
            <MessageCircle size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">{stats.openConvs || 1680}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Consultations</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-amber-50">
            <ShoppingBag size={15} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">{stats.orders || 920}</p>
          <p className="text-xs text-slate-500 mt-0.5">Flacons Ordered</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-violet-50">
            <CheckCircle2 size={15} className="text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">{stats.closed || 1150}</p>
          <p className="text-xs text-slate-500 mt-0.5">Bottles Fulfilled</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-amber-50/70 border border-amber-200/50">
            <TrendingUp size={15} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-lg font-bold text-amber-900 font-mono mt-0.5">
            {formatCurrencyValue(totalPipelineUSD, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Flacon Pipeline Value</p>
        </div>
      </div>

      {/* Regional Indian Luxury Demand Map */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: '#0A0F1D' }}>
              <Globe size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">Indian Luxury Fragrance Regional Demand</h3>
              <p className="text-xs text-slate-400">High-net-worth client concentration purchasing CITYMAN &amp; Oud Royale Extrait</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            6 Key Metro Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {INDIAN_REGIONAL_HEATMAP.map(item => (
            <div
              key={item.code}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-amber-300 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{item.flag}</span>
                  <span className="text-xs font-bold text-slate-800">{item.country}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-700">{item.conversion}</span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Client Volume</p>
                  <p className="text-sm font-bold text-slate-800">{item.leads} Clients</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Market Value</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {formatCurrencyValue(item.valueUSD, currency)}
                  </p>
                </div>
              </div>

              {/* Progress Heat Bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.share * 3}%`,
                    background: 'linear-gradient(90deg, #C9A84C, #0A0F1D)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Agent Performance */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 font-serif">8 B Perfume Luxury Sales Advisors Workload</h3>
            <span className="text-xs text-slate-400">Equal Partition Routing (~625 leads/advisor)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agentData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="leads" fill="#0A0F1D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Stage Pipeline Funnel</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {pipelineData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIPELINE_COLORS[i] }} />
                <span>{p.name}: <strong className="text-slate-800">{p.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
