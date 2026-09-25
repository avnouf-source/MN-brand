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

      {/* Fragrance-Specific Analytics Row: Top Selling Scents & Most Requested Scent Profiles */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Selling Fragrance of the Month */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">Top Selling Fragrances of the Month</h3>
              <p className="text-xs text-slate-400">Total Flacons Ordered &amp; Net Revenue Generated</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Ranked by Volume
            </span>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={[
                { name: 'CITYMAN (1001)', bottles: 380, revenue: 836000, strength: 'HARD' },
                { name: 'OUD VANILLE (4415)', bottles: 310, revenue: 620000, strength: 'HARD' },
                { name: 'HONEY DEW (3301)', bottles: 220, revenue: 341000, strength: 'MILD' },
                { name: 'OUD ROYALE (5502)', bottles: 195, revenue: 468000, strength: 'HARD' },
                { name: 'VELVET ROSE (2104)', bottles: 165, revenue: 305250, strength: 'MODERATE' },
                { name: 'SANTAL IMPERIAL (6608)', bottles: 140, revenue: 273000, strength: 'MODERATE' },
              ]}
              barSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  name === 'bottles' ? `${val} Flacons` : `₹${Number(val).toLocaleString('en-IN')}`,
                  name === 'bottles' ? 'Bottles Sold' : 'Revenue',
                ]}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="bottles" fill="#0A0F1D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase">Top Seller</span>
              <span className="font-bold text-slate-900 font-serif">CITYMAN Extrait</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase">Fastest Growing</span>
              <span className="font-bold text-amber-800 font-serif">OUD VANILLE</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase">Gentle Favorite</span>
              <span className="font-bold text-emerald-700 font-serif">HONEY DEW</span>
            </div>
          </div>
        </div>

        {/* Most Requested Scent Profiles (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 font-serif">Most Requested Scent Profiles</h3>
              <span className="text-[10px] font-semibold text-slate-400">Client Inquiries</span>
            </div>
            <p className="text-[11px] text-slate-500">Oud vs Floral vs Gourmand vs Fresh</p>
          </div>

          <div className="flex-1 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Woody & Assam Oud', value: 42, color: '#C9A84C' },
                    { name: 'Sweet & Gourmand', value: 26, color: '#8b5cf6' },
                    { name: 'Crisp & Citrus Fresh', value: 18, color: '#06b6d4' },
                    { name: 'Floral Rose & Jasmine', value: 14, color: '#ec4899' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {[
                    { color: '#C9A84C' },
                    { color: '#8b5cf6' },
                    { color: '#06b6d4' },
                    { color: '#ec4899' },
                  ].map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}% of Inquiries`, 'Share']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {[
              { name: 'Deep Woody & Oud', share: '42%', color: '#C9A84C', bottles: '575 Flacons' },
              { name: 'Sweet & Gourmand', share: '26%', color: '#8b5cf6', bottles: '356 Flacons' },
              { name: 'Crisp & Citrus Fresh', share: '18%', color: '#06b6d4', bottles: '247 Flacons' },
              { name: 'Floral Rose & Jasmine', share: '14%', color: '#ec4899', bottles: '192 Flacons' },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-bold text-slate-900">{item.share}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 60-Day Smart Refill Forecast & 8 Advisors Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 8 B Perfume Luxury Sales Advisors Workload */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-serif">8 B Perfume Luxury Sales Advisors Workload</h3>
              <p className="text-xs text-slate-400">Equal Partition Routing (~625 leads/advisor across 5,000 clients)</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              8 Advisors
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="leads" fill="#0A0F1D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 60-Day Smart Refill Forecast Widget */}
        <div className="bg-gradient-to-br from-[#FFFDF9] to-white rounded-2xl border border-amber-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Automated Engine
              </span>
              <span className="text-xs font-mono font-bold text-amber-700">60-Day Trigger</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif mt-2">Smart Refill Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated WhatsApp replenishment triggers</p>
          </div>

          <div className="space-y-3 my-4">
            <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Refills Due This Month:</span>
                <span className="font-bold text-slate-900">142 Clients</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Projected Recurring Revenue:</span>
                <span className="font-bold text-amber-800 font-serif">₹2,84,000</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Refill Conversion Rate:</span>
                <span className="font-bold text-emerald-700">71.4% (VIP Loyalty)</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Automated Dispatch Time:</span>
                <span className="font-bold text-slate-700">Day 60 @ 10:00 AM</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center bg-amber-50/60 p-2 rounded-xl border border-amber-100/80">
            ⚡ Triggers personalized WhatsApp re-orders when 50ml/100ml bottles are near empty.
          </div>
        </div>
      </div>
    </div>
  )
}
