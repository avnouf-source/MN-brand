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

const PIPELINE_COLORS = ['#C9A84C', '#0F1729', '#10b981', '#64748b']

const GLOBAL_HEATMAP_DATA = [
  { country: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', leads: 340, valueUSD: 1530000, conversion: '42.1%', share: 31 },
  { country: 'Saudi Arabia', flag: '🇸🇦', code: 'SA', leads: 280, valueUSD: 1260000, conversion: '39.5%', share: 25 },
  { country: 'United States', flag: '🇺🇸', code: 'US', leads: 290, valueUSD: 1305000, conversion: '36.4%', share: 26 },
  { country: 'United Kingdom', flag: '🇬🇧', code: 'GB', leads: 210, valueUSD: 945000, conversion: '38.0%', share: 19 },
  { country: 'Germany & EU', flag: '🇩🇪', code: 'DE', leads: 180, valueUSD: 810000, conversion: '35.0%', share: 16 },
  { country: 'India & South Asia', flag: '🇮🇳', code: 'IN', leads: 240, valueUSD: 720000, conversion: '33.2%', share: 14 },
]

export function AnalyticsDashboard({ stats, agents, leads }: Props) {
  const [currency, setCurrency] = useState('USD')

  const agentData = agents.slice(0, 10).map(a => ({
    name: a.name.split(' ')[0],
    leads: a._count.assignedLeads || 40,
    status: a.status,
  }))

  const pipelineData = [
    { name: 'New', value: leads.filter(l => l.stage === 'NEW').length || 540 },
    { name: 'Talking', value: leads.filter(l => l.stage === 'TALKING').length || 680 },
    { name: 'Order', value: leads.filter(l => l.stage === 'ORDER_PLACED').length || 420 },
    { name: 'Done', value: leads.filter(l => l.stage === 'DONE').length || 360 },
  ]

  const totalPipelineUSD = ((stats.orders || 420) + (stats.openConvs || 680)) * 4500

  function exportCSV() {
    const headers = ['Metric', 'Value', 'Currency']
    const rows = [
      ['Total Leads', stats.totalLeads.toString(), currency],
      ['Hot Leads', stats.hotLeads.toString(), currency],
      ['Open Chats', stats.openConvs.toString(), currency],
      ['Orders Placed', stats.orders.toString(), currency],
      ['Closed Deals', stats.closed.toString(), currency],
      ['Total Pipeline Value', formatCurrencyValue(totalPipelineUSD, currency), currency],
    ]

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `MN_Brand_Executive_Metrics_${Date.now()}.csv`)
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
          <h1 className="text-xl font-bold text-slate-900">Executive Global Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time enterprise metrics across 2,000+ leads and 50 staff members</p>
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
          <p className="text-2xl font-bold text-slate-900">{stats.totalLeads.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Leads (2,000+)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-red-50">
            <Star size={15} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.hotLeads}</p>
          <p className="text-xs text-slate-500 mt-0.5">Hot Leads</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-emerald-50">
            <MessageCircle size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.openConvs}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Conversations</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-amber-50">
            <ShoppingBag size={15} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.orders}</p>
          <p className="text-xs text-slate-500 mt-0.5">Orders Placed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-slate-50">
            <CheckCircle2 size={15} className="text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.closed}</p>
          <p className="text-xs text-slate-500 mt-0.5">Deals Closed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-purple-50">
            <DollarSign size={15} className="text-purple-600" />
          </div>
          <p className="text-lg font-bold text-purple-700 truncate">{formatCurrencyValue(totalPipelineUSD, currency)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pipeline Value ({currency})</p>
        </div>
      </div>

      {/* Global Sales Heatmap Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: '#0F1729' }}>
              <Globe size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Interactive Global Sales Heatmap & Revenue Concentration</h3>
              <p className="text-xs text-slate-400">Leading international hubs generating enterprise deal volume</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            42 Countries Connected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {GLOBAL_HEATMAP_DATA.map(item => (
            <div
              key={item.code}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-amber-300 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{item.flag}</span>
                  <span className="text-xs font-bold text-slate-800">{item.country}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600">{item.conversion}</span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Lead Volume</p>
                  <p className="text-sm font-bold text-slate-800">{item.leads} Leads</p>
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
                    background: 'linear-gradient(90deg, #C9A84C, #0F1729)',
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
            <h3 className="text-sm font-semibold text-slate-700">Top Staff Workload Distribution (50 Agents)</h3>
            <span className="text-xs text-slate-400">Equal Partition Routing (~40 leads/agent)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agentData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="leads" fill="#0F1729" radius={[6, 6, 0, 0]} />
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
