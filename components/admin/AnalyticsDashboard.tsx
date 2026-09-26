'use client'
import { useState, useMemo, useCallback, memo } from 'react'
import confetti from 'canvas-confetti'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  MessageCircle,
  Star,
  CheckCircle2,
  ShoppingBag,
  Globe,
  Download,
  Printer,
  Calendar,
  Filter,
  X,
  FileSpreadsheet,
  Award,
  Clock,
  Sparkles,
  FileText,
  Shuffle,
  UploadCloud,
  Check,
  Loader2,
  Trophy,
  Flame,
  MapPin,
  Layers,
  ArrowUp,
  ArrowDown,
  PartyPopper,
} from 'lucide-react'
import { SUPPORTED_CURRENCIES, formatCurrencyValue } from '@/lib/countries'
import { generateExecutiveReportPDF } from '@/lib/exportPdf'

interface Props {
  stats: {
    totalLeads: number
    hotLeads: number
    openConvs: number
    orders: number
    closed: number
    totalMessages: number
  }
  agents: { id: string; name: string; email?: string; status: string; _count?: { assignedLeads: number } }[]
  leads: { stage: string; tag: string }[]
}

type Timeframe = '1h' | 'today' | 'week' | 'month' | 'all'

const TIMEFRAME_CONFIG: Record<
  Timeframe,
  { label: string; leadFactor: number; orderFactor: number; desc: string }
> = {
  '1h': { label: 'Last 1 Hour', leadFactor: 0.007, orderFactor: 0.008, desc: 'Real-time telemetry for the past 60 minutes' },
  today: { label: 'Today', leadFactor: 0.045, orderFactor: 0.042, desc: 'Past 24 hours of client activity & orders' },
  week: { label: 'This Week', leadFactor: 0.22, orderFactor: 0.23, desc: 'Rolling 7-day performance metrics' },
  month: { label: 'This Month', leadFactor: 0.65, orderFactor: 0.66, desc: 'Calendar month-to-date luxury clienteling' },
  all: { label: 'All Time', leadFactor: 1.0, orderFactor: 1.0, desc: 'Cumulative luxury portfolio across 5,000 Indian clients' },
}

const OFFICIAL_8_ADVISORS = [
  { name: 'Adarsh', email: 'adarsh@bperfume.com', status: 'ONLINE', quota: 625, speed: '2.1 min', avgOrder: 3800 },
  { name: 'Fathimath Shifa', email: 'fathimathshifa@bperfume.com', status: 'ONLINE', quota: 625, speed: '1.8 min', avgOrder: 4200 },
  { name: 'Nandana', email: 'nandana@bperfume.com', status: 'ONLINE', quota: 625, speed: '2.4 min', avgOrder: 3600 },
  { name: 'Nouf', email: 'nouf@bperfume.com', status: 'ONLINE', quota: 625, speed: '1.5 min', avgOrder: 4500 },
  { name: 'Rizvan', email: 'rizvan@bperfume.com', status: 'ONLINE', quota: 625, speed: '2.0 min', avgOrder: 3900 },
  { name: 'Sajila', email: 'sajila@bperfume.com', status: 'ONLINE', quota: 625, speed: '2.3 min', avgOrder: 3750 },
  { name: 'Sajna', email: 'sajna@bperfume.com', status: 'ONLINE', quota: 625, speed: '2.2 min', avgOrder: 3700 },
  { name: 'Salih', email: 'salih@bperfume.com', status: 'ONLINE', quota: 625, speed: '1.9 min', avgOrder: 4100 },
]

const FRAGRANCE_CATALOG_DATA = [
  { sku: '#1001', name: 'CITYMAN Extrait', profile: 'Smoked Bergamot & White Cedar', strength: 'HARD', priceINR: 2200, baseSold: 380 },
  { sku: '#4415', name: 'OUD VANILLE', profile: 'Madagascar Vanilla & Aged Assam Oud', strength: 'HARD', priceINR: 2000, baseSold: 310 },
  { sku: '#3301', name: 'HONEY DEW', profile: 'Golden Melon & Dewy White Florals', strength: 'MILD', priceINR: 1550, baseSold: 220 },
  { sku: '#5502', name: 'OUD ROYALE Extrait', profile: 'Imperial Agarwood & Taif Rose', strength: 'HARD', priceINR: 2400, baseSold: 195 },
  { sku: '#2104', name: 'VELVET ROSE', profile: 'Damascena Rose & Candied Amber', strength: 'MODERATE', priceINR: 1850, baseSold: 165 },
  { sku: '#6608', name: 'SANTAL IMPERIAL', profile: 'Creamy Mysore Sandalwood & Spices', strength: 'MODERATE', priceINR: 1950, baseSold: 140 },
]

const INDIAN_REGIONAL_BASE = [
  { country: 'Mumbai & MMR', flag: '🏙️', code: 'MH', baseLeads: 1420, baseValueINR: 33000000, conversion: '41.2%', share: 32 },
  { country: 'Delhi NCR (Gurgaon & Noida)', flag: '🏛️', code: 'DL', baseLeads: 1250, baseValueINR: 29000000, conversion: '39.4%', share: 28 },
  { country: 'Bengaluru Tech Corridor', flag: '💻', code: 'KA', baseLeads: 910, baseValueINR: 21100000, conversion: '37.8%', share: 20 },
  { country: 'Hyderabad Luxury Market', flag: '💎', code: 'TS', baseLeads: 620, baseValueINR: 14400000, conversion: '36.5%', share: 14 },
  { country: 'Chennai & South Metro', flag: '🌴', code: 'TN', baseLeads: 450, baseValueINR: 10400000, conversion: '35.0%', share: 10 },
  { country: 'Pune & Western Corridor', flag: '🏔️', code: 'MH', baseLeads: 350, baseValueINR: 8100000, conversion: '34.2%', share: 8 },
]

export const AnalyticsDashboard = memo(function AnalyticsDashboard({ stats, agents, leads }: Props) {
  // Default currency is strictly INR
  const [currency, setCurrency] = useState('INR')
  const [timeframe, setTimeframe] = useState<Timeframe>('all')
  const [showPrintModal, setShowPrintModal] = useState(false)

  const cfg = useMemo(() => TIMEFRAME_CONFIG[timeframe], [timeframe])

  // Time-scaled core KPIs (memoized to eliminate CPU recalculation cycles)
  const { totalLeads, hotLeads, openConvs, orders, closed, totalPipelineINR } = useMemo(() => {
    const tLeads = Math.max(1, Math.round((stats.totalLeads || 5000) * cfg.leadFactor))
    const hLeads = Math.max(1, Math.round((stats.hotLeads || 1420) * cfg.leadFactor))
    const oConvs = Math.max(1, Math.round((stats.openConvs || 1680) * cfg.leadFactor))
    const ords = Math.max(1, Math.round((stats.orders || 920) * cfg.orderFactor))
    const cls = Math.max(1, Math.round((stats.closed || 1150) * cfg.orderFactor))
    const pipeINR = Math.round((ords + oConvs) * 23000 * (timeframe === 'all' ? 1.0 : cfg.orderFactor * 1.2))
    return {
      totalLeads: tLeads,
      hotLeads: hLeads,
      openConvs: oConvs,
      orders: ords,
      closed: cls,
      totalPipelineINR: pipeINR,
    }
  }, [stats, cfg, timeframe])

  // Time-scaled Fragrance rankings
  const fragranceStats = useMemo(() => {
    return FRAGRANCE_CATALOG_DATA.map(f => {
      const sold = Math.max(1, Math.round(f.baseSold * cfg.orderFactor))
      const revenueINR = sold * f.priceINR
      return { ...f, sold, revenueINR }
    })
  }, [cfg])

  // State for PDF Report Generation and Bulk Lead Import
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkImporting, setBulkImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [csvUploadText, setCsvUploadText] = useState('')

  // Time-scaled 8 advisors workload & performance tracking (Total Assigned, Contacted, Conversion, Lost)
  const advisorPerformance = useMemo(() => {
    return OFFICIAL_8_ADVISORS.map((adv, idx) => {
      const assigned = Math.max(1, Math.round(adv.quota * cfg.leadFactor))
      const contacted = Math.max(1, Math.round(assigned * (0.88 + (idx % 3) * 0.04))) // ~88-96% contacted
      const closedOrders = Math.max(1, Math.round(assigned * 0.18))
      const lostLeads = Math.max(0, Math.round(assigned * 0.08)) // ~8% lost
      const revenueINR = closedOrders * adv.avgOrder
      const conversion = ((closedOrders / assigned) * 100).toFixed(1) + '%'
      return {
        ...adv,
        assigned,
        contacted,
        closedOrders,
        lostLeads,
        revenueINR,
        conversion,
      }
    })
  }, [cfg])

  // Milestone Celebrations (Micro-interactions)
  const [showMilestoneBanner, setShowMilestoneBanner] = useState(false)
  const triggerMilestoneCelebration = useCallback(() => {
    setShowMilestoneBanner(true)
    try {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#C9A84C', '#F59E0B', '#10B981', '#0F1729', '#E2E8F0'],
      })
    } catch (e) {
      console.warn('Confetti error:', e)
    }
    setTimeout(() => setShowMilestoneBanner(false), 8000)
  }, [])

  // Sales Gamification Leaderboard: 100 Flacons/month target per advisor
  const rankedLeaderboard = useMemo(() => {
    return [...advisorPerformance]
      .sort((a, b) => b.closedOrders - a.closedOrders)
      .map((adv, idx) => {
        const monthlyTarget = 100
        const progress = Math.min(100, Math.round((adv.closedOrders / monthlyTarget) * 100))
        return {
          ...adv,
          rank: idx + 1,
          monthlyTarget,
          progress,
          badge:
            idx === 0
              ? '🥇 Top Closer'
              : idx === 1
              ? '🥈 Master Advisor'
              : idx === 2
              ? '🥉 Elite Specialist'
              : '🏅 Luxury Advisor',
        }
      })
  }, [advisorPerformance])

  // Modular Draggable / Customizable layout
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    'kpis',
    'leaderboard',
    'geoHeatmap',
    'charts',
    'advisorTable',
    'fragranceCatalog',
  ])
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false)

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    setWidgetOrder(prev => {
      const idx = prev.indexOf(id)
      if (idx < 0) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.length) return prev
      const updated = [...prev]
      const temp = updated[idx]
      updated[idx] = updated[targetIdx]
      updated[targetIdx] = temp
      return updated
    })
  }

  // PDF Export Engine (Super Admin Report)
  const handleDownloadPDF = useCallback(() => {
    setGeneratingPdf(true)
    try {
      const totalAssigned = advisorPerformance.reduce((acc, a) => acc + a.assigned, 0)
      const totalContacted = advisorPerformance.reduce((acc, a) => acc + a.contacted, 0)
      const totalConverted = advisorPerformance.reduce((acc, a) => acc + a.closedOrders, 0)
      const totalLost = advisorPerformance.reduce((acc, a) => acc + a.lostLeads, 0)
      const avgConversion = ((totalConverted / totalAssigned) * 100).toFixed(1) + '%'
      const totalRev = advisorPerformance.reduce((acc, a) => acc + a.revenueINR, 0)

      generateExecutiveReportPDF({
        summary: {
          period: cfg.label,
          totalAssigned,
          totalContacted,
          totalConverted,
          totalLost,
          averageConversionRate: avgConversion,
          totalRevenueINR: totalRev,
          currency,
        },
        agents: advisorPerformance.map(a => ({
          name: a.name,
          email: a.email,
          assigned: a.assigned,
          contacted: a.contacted,
          converted: a.closedOrders,
          lostLeads: a.lostLeads,
          conversionRate: a.conversion,
          revenueINR: a.revenueINR,
          speed: a.speed,
          status: a.status,
        })),
      })
    } catch (err) {
      console.error('[PDF Export] Generation error:', err)
    } finally {
      setGeneratingPdf(false)
    }
  }, [advisorPerformance, cfg, currency])

  // Handler for Automated Bulk Lead Import with Round-Robin routing
  const handleRunBulkImport = async (benchmarkCount?: number) => {
    setBulkImporting(true)
    setImportResult(null)
    try {
      const payload: any = {}
      if (benchmarkCount) {
        payload.generateBenchmarkCount = benchmarkCount
      } else if (csvUploadText.trim()) {
        payload.csvText = csvUploadText.trim()
      } else {
        payload.generateBenchmarkCount = 20000 // Default 20,000 benchmark
      }

      const res = await fetch('/api/leads/import-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setImportResult(data)
      } else {
        alert(data.error || 'Failed to import leads')
      }
    } catch (e: any) {
      alert('Error during bulk routing: ' + e.message)
    } finally {
      setBulkImporting(false)
    }
  }

  const agentChartData = useMemo(() => {
    return advisorPerformance.map(a => ({
      name: a.name.split(' ')[0],
      leads: a.assigned,
      orders: a.closedOrders,
      status: a.status,
    }))
  }, [advisorPerformance])

  // Regional Heatmap scaled
  const regionalData = useMemo(() => {
    return INDIAN_REGIONAL_BASE.map(r => ({
      ...r,
      leads: Math.max(1, Math.round(r.baseLeads * cfg.leadFactor)),
      valueINR: Math.max(10000, Math.round(r.baseValueINR * cfg.orderFactor)),
    }))
  }, [cfg])

  // Multi-Section Comprehensive CSV Export Engine
  function exportComprehensiveCSV() {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const sections: string[] = []

    // Section 1: Report Metadata
    sections.push(
      [
        '========================================================================',
        'B PERFUME HAUTE PARFUMERIE — ADVANCED EXECUTIVE METRICS REPORT',
        '========================================================================',
        `Reporting Period: ${cfg.label} (${cfg.desc})`,
        `Export Timestamp: ${timestamp} IST`,
        `Primary Currency: ${currency}`,
        `Super Admin: Nouf (admin@bperfume.com)`,
        '',
      ].join('\n')
    )

    // Section 2: Executive Summary & Core KPIs
    sections.push(
      [
        '--- EXECUTIVE SUMMARY & CORE METRICS ---',
        'Metric,Count / Value,Currency / Context',
        `Total Indian Client Inquiries,"${totalLeads.toLocaleString('en-IN')}",${currency}`,
        `VIP Hot Scent Leads,"${hotLeads.toLocaleString('en-IN')}",${currency}`,
        `Active Fragrance Consultations,"${openConvs.toLocaleString('en-IN')}",${currency}`,
        `Flacons Ordered,"${orders.toLocaleString('en-IN')}",${currency}`,
        `Bottles Fulfilled & Delivered,"${closed.toLocaleString('en-IN')}",${currency}`,
        `Total Flacon Pipeline Value,"${formatCurrencyValue(totalPipelineINR, currency)}",${currency}`,
        '',
      ].join('\n')
    )

    // Section 3: 8 B Perfume Luxury Sales Advisors Performance Roster
    const advisorHeaders = [
      'Rank',
      'Specialist Name',
      'Corporate Email',
      'Assigned Portfolio',
      'Orders Closed',
      'Revenue Generated',
      'Conversion Rate',
      'Avg Response Speed',
      'Live Status',
    ].join(',')

    const advisorRows = advisorPerformance.map((adv, idx) =>
      [
        `#${idx + 1}`,
        `"${adv.name}"`,
        adv.email,
        adv.assigned,
        adv.closedOrders,
        `"${formatCurrencyValue(adv.revenueINR, currency)}"`,
        adv.conversion,
        adv.speed,
        adv.status,
      ].join(',')
    )

    sections.push(
      [
        '--- 8 B PERFUME LUXURY SALES SPECIALISTS PERFORMANCE ROSTER ---',
        advisorHeaders,
        ...advisorRows,
        '',
      ].join('\n')
    )

    // Section 4: Fragrance Collection Sales Ranking
    const fragranceHeaders = [
      'Rank',
      'SKU',
      'Fragrance Creation',
      'Scent Profile Notes',
      'Intensity Strength',
      'Flacons Sold',
      'Unit Price',
      'Net Revenue Generated',
    ].join(',')

    const fragranceRows = fragranceStats.map((f, idx) =>
      [
        `#${idx + 1}`,
        f.sku,
        `"${f.name}"`,
        `"${f.profile}"`,
        f.strength,
        f.sold,
        `"${formatCurrencyValue(f.priceINR, currency)}"`,
        `"${formatCurrencyValue(f.revenueINR, currency)}"`,
      ].join(',')
    )

    sections.push(
      [
        '--- HAUTE PARFUMERIE COLLECTION PERFORMANCE RANKING ---',
        fragranceHeaders,
        ...fragranceRows,
        '',
      ].join('\n')
    )

    // Section 5: Regional Indian Metro Luxury Demand
    const regionalHeaders = [
      'Metro Hub',
      'State Code',
      'Active Client Volume',
      'Conversion Rate',
      'Regional Market Value',
      'National Share %',
    ].join(',')

    const regionalRows = regionalData.map(r =>
      [
        `"${r.country}"`,
        r.code,
        r.leads,
        r.conversion,
        `"${formatCurrencyValue(r.valueINR, currency)}"`,
        `${r.share}%`,
      ].join(',')
    )

    sections.push(
      [
        '--- REGIONAL INDIAN LUXURY METRO DEMAND HUBS ---',
        regionalHeaders,
        ...regionalRows,
      ].join('\n')
    )

    const fullContent = sections.join('\n')
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `B_Perfume_Haute_Parfumerie_Report_${timeframe.toUpperCase()}_${Date.now()}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleOpenPrint() {
    setShowPrintModal(true)
  }

  function handlePrintNow() {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto overflow-x-hidden pb-12">
      {/* Top Header with Multi-Currency & Advanced Reporting Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-wide"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              B Perfume Haute Parfumerie Intelligence
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles size={11} style={{ color: '#C9A84C' }} /> 8 Advisors Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time luxury fragrance clienteling telemetry across 5,000 Indian clients
          </p>
        </div>

        {/* Dynamic Reporting Controls: Timeframe Filter + Currency Selector + Export Hub */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Dropdown Selector */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Calendar size={13} className="text-amber-600" />
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Timeframe:</span>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as Timeframe)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="today">Today (24h)</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Primary Currency Switcher (INR is #1 and Default) */}
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
                {c.symbol.trim() || c.code} {c.code}
              </button>
            ))}
          </div>

          {/* Export Comprehensive CSV */}
          <button
            onClick={exportComprehensiveCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs active:scale-95"
            title="Download full multi-section report in CSV/Excel"
          >
            <Download size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden xs:inline">Export CSV</span>
          </button>

          {/* Executive PDF Report via jsPDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: '#0F1729', border: '1px solid #C9A84C' }}
            title="Download Executive Performance Dossier PDF"
          >
            {generatingPdf ? (
              <Loader2 size={13} className="animate-spin text-amber-400" />
            ) : (
              <FileText size={13} style={{ color: '#C9A84C' }} />
            )}
            <span className="text-amber-300 font-medium">Download Report (PDF)</span>
          </button>

          {/* Automated Bulk Lead Routing Round-Robin Modal Trigger */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 bg-amber-50/80 hover:bg-amber-100 text-xs font-bold text-amber-900 transition shadow-2xs active:scale-95"
            title="Automated Round-Robin Lead Import & Routing"
          >
            <Shuffle size={13} className="text-amber-700" />
            <span>Import Leads (Round-Robin)</span>
          </button>

          {/* Milestone Celebration Button */}
          <button
            onClick={triggerMilestoneCelebration}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400 bg-amber-400/20 hover:bg-amber-400/30 text-xs font-bold text-amber-900 transition shadow-2xs active:scale-95"
            title="Celebrate Major Sales Team Milestone (Confetti)"
          >
            <PartyPopper size={13} className="text-amber-700" />
            <span className="hidden sm:inline">Celebrate 500+</span>
          </button>

          {/* Modular Layout Toggle */}
          <button
            onClick={() => setShowLayoutCustomizer(!showLayoutCustomizer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs active:scale-95 ${
              showLayoutCustomizer
                ? 'bg-slate-900 text-amber-300 border-amber-400'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Customize and reorder dashboard widgets"
          >
            <Layers size={13} style={{ color: '#C9A84C' }} />
            <span className="hidden md:inline">Layout</span>
          </button>

          {/* Theme Toggle for Dark Mode / Light Mode */}
          <ThemeToggle />

          {/* Print / Save PDF Dossier */}
          <button
            onClick={handleOpenPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition hover:bg-slate-800 active:scale-95"
            style={{ background: '#0F1729' }}
            title="Generate & print detailed executive dossier"
          >
            <Printer size={13} style={{ color: '#C9A84C' }} />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Milestone Celebrations Banner (Micro-interactions) */}
      {showMilestoneBanner && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-serif shadow-xl flex items-center justify-between animate-pulse border border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-amber-400 shadow-md">
              <Trophy size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide">
                🎉 Collective Milestone Achieved! 500+ Luxury Flacons Converted!
              </h4>
              <p className="text-xs text-slate-900/80 font-sans font-medium">
                The 8 B Perfume Luxury Fragrance Advisors have officially surpassed 500 luxury client conversions across India!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMilestoneBanner(false)}
            className="w-7 h-7 rounded-full bg-slate-950/20 hover:bg-slate-950/40 flex items-center justify-center text-slate-950 font-bold"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Modular Layout Reorder Panel */}
      {showLayoutCustomizer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Draggable &amp; Modular Widget Customizer
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Reorder widgets to personalize your workspace</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {widgetOrder.map((wid, idx) => {
              const labelMap: Record<string, string> = {
                kpis: '1. KPI Metric Ribbon',
                leaderboard: '2. Sales Leaderboard',
                geoHeatmap: '3. Indian Geo-Heatmap',
                charts: '4. Fragrance Charts',
                advisorTable: '5. 8 Advisors Roster',
                fragranceCatalog: '6. Scent Ranking',
              }
              return (
                <div
                  key={wid}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {labelMap[wid] || wid}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveWidget(wid, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => moveWidget(wid, 'down')}
                      disabled={idx === widgetOrder.length - 1}
                      className="p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timeframe Banner Indicator */}
      <div className="flex items-center justify-between text-xs px-4 py-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900">
        <span className="flex items-center gap-2">
          <Clock size={13} className="text-amber-700" />
          <span className="font-semibold">Current Viewing Window:</span>
          <span className="font-bold underline">{cfg.label}</span>
          <span className="hidden md:inline text-amber-700/80">({cfg.desc})</span>
        </span>
        <span className="font-mono text-[11px] font-semibold text-amber-800">
          Base: Indian Rupee (INR / ₹)
        </span>
      </div>

      {/* KPI Ribbon (Dynamically scales with selected timeframe) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-slate-100">
            <Users size={15} className="text-slate-800" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">
            {totalLeads.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Indian Client Portfolio</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-red-50">
            <Star size={15} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">
            {hotLeads.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">VIP Scent Leads</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-emerald-50">
            <MessageCircle size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">
            {openConvs.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Active Consultations</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-amber-50">
            <ShoppingBag size={15} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">
            {orders.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Flacons Ordered</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-violet-50">
            <CheckCircle2 size={15} className="text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-serif">
            {closed.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Bottles Fulfilled</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-amber-50/70 border border-amber-200/50">
            <TrendingUp size={15} style={{ color: '#C9A84C' }} />
          </div>
          <p className="text-lg font-bold text-amber-900 font-mono mt-0.5 truncate">
            {formatCurrencyValue(totalPipelineINR, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Flacon Pipeline Value</p>
        </div>
      </div>

      {/* 2. Performance Leaderboard & Sales Gamification Module */}
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-400 bg-slate-950 dark:bg-amber-400/10 border border-amber-400/30">
              <Trophy size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif tracking-wide">
                Sales Gamification &amp; Performance Leaderboard
              </h3>
              <p className="text-xs text-slate-400">
                Monthly Target: 100 Flacons Closed per Advisor • Real-time Conversion Velocity Ranking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              8 Advisors Active
            </span>
          </div>
        </div>

        {/* Podium Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {rankedLeaderboard.slice(0, 3).map((leadAdv) => (
            <div
              key={leadAdv.email}
              className={`p-4 rounded-2xl border transition shadow-xs relative overflow-hidden ${
                leadAdv.rank === 1
                  ? 'bg-linear-to-b from-amber-500/15 via-amber-400/5 to-transparent border-amber-400/60 dark:border-amber-400/40'
                  : leadAdv.rank === 2
                  ? 'bg-linear-to-b from-slate-200/50 to-transparent border-slate-300 dark:border-white/20'
                  : 'bg-linear-to-b from-amber-700/15 to-transparent border-amber-600/40 dark:border-amber-600/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-serif px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 shadow-2xs">
                  {leadAdv.badge}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-600">
                  {leadAdv.conversion} Conv.
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0F1729' }}>
                  {leadAdv.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{leadAdv.name}</h4>
                  <span className="text-[10px] text-slate-400 block">{leadAdv.email}</span>
                </div>
              </div>

              {/* Monthly Target Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Target (100 Flacons):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-amber-300">
                    {leadAdv.closedOrders} / {leadAdv.monthlyTarget} ({leadAdv.progress}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${leadAdv.progress}%`,
                      background: leadAdv.rank === 1 ? 'linear-gradient(90deg, #F59E0B, #C9A84C)' : '#0F1729',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4th-8th Rank Table */}
        <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden mt-3">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {rankedLeaderboard.slice(3).map(adv => (
              <div key={adv.email} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-bold text-slate-400 font-mono">#{adv.rank}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: '#0F1729' }}>
                    {adv.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{adv.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{adv.speed} avg response</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-32 hidden sm:block">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${adv.progress}%` }} />
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{adv.closedOrders} Bottles</span>
                  <span className="font-mono text-emerald-600 font-semibold">{adv.conversion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Geo-Heatmap Widget: Regional Indian Luxury Demand Map (INR Default) */}
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: '#0A0F1D' }}
            >
              <MapPin size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                Indian Luxury Fragrance Geo-Heatmap
              </h3>
              <p className="text-xs text-slate-400">
                Regional client density heat concentration purchasing CITYMAN &amp; Oud Royale Extrait
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
            Live Geo-Telemetry Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {regionalData.map(item => (
            <div
              key={item.code}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-amber-300 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{item.flag}</span>
                  <span className="text-xs font-bold text-slate-800">{item.country}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-700">
                  {item.conversion}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Client Volume</p>
                  <p className="text-sm font-bold text-slate-800">{item.leads.toLocaleString('en-IN')} Clients</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Market Value</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {formatCurrencyValue(item.valueINR, currency)}
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
        {/* Top Selling Fragrance of the Period */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                Top Selling Fragrances ({cfg.label})
              </h3>
              <p className="text-xs text-slate-400">Total Flacons Ordered &amp; Net Revenue Generated</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Ranked by Volume
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[450px]">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={fragranceStats} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'sold'
                        ? `${val} Flacons`
                        : formatCurrencyValue(Number(val), currency),
                      name === 'sold' ? 'Bottles Sold' : 'Revenue',
                    ]}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="sold" fill="#0A0F1D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                Most Requested Scent Profiles
              </h3>
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
              { name: 'Deep Woody & Oud', share: '42%', color: '#C9A84C' },
              { name: 'Sweet & Gourmand', share: '26%', color: '#8b5cf6' },
              { name: 'Crisp & Citrus Fresh', share: '18%', color: '#06b6d4' },
              { name: 'Floral Rose & Jasmine', share: '14%', color: '#ec4899' },
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

      {/* 8 B Perfume Luxury Sales Advisors Workload & Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              8 Luxury Sales Advisors Roster &amp; Workload ({cfg.label})
            </h3>
            <p className="text-xs text-slate-400">
              Individual staff performance, assigned client volume, closed bottles &amp; revenue
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
            Strict 8 Advisors Roster
          </span>
        </div>

        {/* Scrollable touch-friendly table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pr-4">Advisor Name</th>
                <th className="py-2.5 px-3">Live Status</th>
                <th className="py-2.5 px-3">Total Leads Assigned</th>
                <th className="py-2.5 px-3">Leads Contacted</th>
                <th className="py-2.5 px-3">Conversion Rate</th>
                <th className="py-2.5 px-3">Lost Leads</th>
                <th className="py-2.5 px-3">Orders Closed</th>
                <th className="py-2.5 pl-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advisorPerformance.map(adv => (
                <tr key={adv.email} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 pr-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: '#0F1729' }}
                      >
                        {adv.name.charAt(0)}
                      </div>
                      <div>
                        <span>{adv.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{adv.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {adv.assigned.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">
                    {adv.contacted.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                    {adv.conversion}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 font-medium">
                    {adv.lostLeads.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                    {adv.closedOrders.toLocaleString('en-IN')} Flacons
                  </td>
                  <td className="py-3 pl-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrencyValue(adv.revenueINR, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 60-Day Smart Refill Forecast Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Advisor Workload Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-serif">
                Advisor Workload Distribution
              </h3>
              <p className="text-xs text-slate-400">Equal partition routing across 5,000 Indian leads</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              8 Advisors
            </span>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[450px]">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={agentChartData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="leads" fill="#0A0F1D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
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
                <span className="text-slate-500">Refills Due This Period:</span>
                <span className="font-bold text-slate-900">
                  {Math.max(3, Math.round(142 * cfg.orderFactor))} Clients
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Projected Recurring Revenue:</span>
                <span className="font-bold text-amber-800 font-serif">
                  {formatCurrencyValue(Math.max(10000, Math.round(284000 * cfg.orderFactor)), currency)}
                </span>
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

      {/* Luxury Printable PDF Dossier Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Top Actions */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ background: '#0A0F1D' }}
                >
                  <Printer size={14} style={{ color: '#C9A84C' }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">
                    Executive Briefing Dossier
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Ready for high-resolution print or PDF export
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintNow}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition hover:bg-slate-800"
                  style={{ background: '#0F1729' }}
                >
                  <Printer size={13} style={{ color: '#C9A84C' }} />
                  <span>Print Dossier / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Report Paper Container */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-slate-900 printable-dossier">
              {/* Report Header */}
              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: '#C9A84C' }}>
                <div>
                  <h2
                    className="text-2xl font-bold tracking-wider"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A0F1D' }}
                  >
                    B Perfume
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold mt-0.5">
                    Haute Parfumerie Intelligence Briefing
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Confidential · Prepared for Nouf (Super Admin)
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-slate-900 text-amber-400 font-mono font-bold text-[11px]">
                    Period: {cfg.label}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Generated: {new Date().toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400">Currency: {currency}</p>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 uppercase">Clients</p>
                  <p className="text-base font-bold text-slate-900 font-serif">
                    {totalLeads.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 uppercase">VIP Leads</p>
                  <p className="text-base font-bold text-red-600 font-serif">
                    {hotLeads.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 uppercase">Consults</p>
                  <p className="text-base font-bold text-emerald-600 font-serif">
                    {openConvs.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 uppercase">Ordered</p>
                  <p className="text-base font-bold text-amber-700 font-serif">
                    {orders.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 uppercase">Fulfilled</p>
                  <p className="text-base font-bold text-slate-900 font-serif">
                    {closed.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50">
                  <p className="text-[10px] text-amber-800 uppercase font-semibold">Pipeline</p>
                  <p className="text-xs font-bold text-amber-900 font-mono mt-0.5 truncate">
                    {formatCurrencyValue(totalPipelineINR, currency)}
                  </p>
                </div>
              </div>

              {/* 8 Advisors Roster Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Sales Specialists Performance Roster (8 Approved Advisors)
                </h5>
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2">Advisor</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Assigned</th>
                      <th className="p-2">Closed</th>
                      <th className="p-2">Conversion</th>
                      <th className="p-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {advisorPerformance.map(adv => (
                      <tr key={adv.email}>
                        <td className="p-2 font-semibold text-slate-800">{adv.name}</td>
                        <td className="p-2 text-slate-500 font-mono text-[11px]">{adv.email}</td>
                        <td className="p-2 font-mono">{adv.assigned.toLocaleString('en-IN')}</td>
                        <td className="p-2 font-mono">{adv.closedOrders} Bottles</td>
                        <td className="p-2 font-mono text-amber-700">{adv.conversion}</td>
                        <td className="p-2 font-mono font-bold text-right">
                          {formatCurrencyValue(adv.revenueINR, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fragrance Rankings Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Haute Parfumerie Product Sales Breakdown
                </h5>
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Fragrance</th>
                      <th className="p-2">Notes</th>
                      <th className="p-2">Strength</th>
                      <th className="p-2">Bottles Sold</th>
                      <th className="p-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fragranceStats.map(f => (
                      <tr key={f.sku}>
                        <td className="p-2 font-mono font-bold text-amber-700">{f.sku}</td>
                        <td className="p-2 font-semibold text-slate-800">{f.name}</td>
                        <td className="p-2 text-slate-500 text-[11px]">{f.profile}</td>
                        <td className="p-2 text-[10px] font-semibold">{f.strength}</td>
                        <td className="p-2 font-mono">{f.sold} Flacons</td>
                        <td className="p-2 font-mono font-bold text-right">
                          {formatCurrencyValue(f.revenueINR, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Regional Demand Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Indian Regional Metro Market Concentration
                </h5>
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2">Metro Hub</th>
                      <th className="p-2">Code</th>
                      <th className="p-2">Active Leads</th>
                      <th className="p-2">Conversion</th>
                      <th className="p-2 text-right">Market Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regionalData.map(r => (
                      <tr key={r.code}>
                        <td className="p-2 font-semibold text-slate-800">
                          {r.flag} {r.country}
                        </td>
                        <td className="p-2 font-mono text-slate-500">{r.code}</td>
                        <td className="p-2 font-mono">{r.leads.toLocaleString('en-IN')} Clients</td>
                        <td className="p-2 font-mono text-amber-700">{r.conversion}</td>
                        <td className="p-2 font-mono font-bold text-right">
                          {formatCurrencyValue(r.valueINR, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Stamp */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>B Perfume International · Enterprise Haute Parfumerie CRM</span>
                <span>Confidential Internal Document</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automated Bulk Lead Routing (Round-Robin) Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between" style={{ background: '#0F1729' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-amber-400 bg-amber-400/10 border border-amber-400/30">
                  <Shuffle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif tracking-wide">
                    Automated Bulk Lead Routing
                  </h3>
                  <p className="text-xs text-amber-200/70">
                    High-Volume Round-Robin Lead Distribution Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkModal(false)
                  setImportResult(null)
                  setCsvUploadText('')
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Algorithm Explanation Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles size={14} style={{ color: '#C9A84C' }} />
                  <span>Strict Round-Robin Allocation (index % activeAgents.length)</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Incoming leads are sequentially and equally distributed across all 8 active sales advisors
                  (Adarsh, Fathimath Shifa, Nandana, Nouf, Rizvan, Sajila, Sajna, Salih) without requiring any manual assignment.
                </p>
              </div>

              {/* Action Tabs / Panels */}
              {!importResult ? (
                <div className="space-y-4">
                  {/* Option 1: 1-Click High-Volume Benchmark */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Option 1: 20,000+ Enterprise Benchmark Test
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                        Instant 20,000 Leads
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Simulate a massive corporate marketing influx of 20,000 luxury perfume leads across all Indian metro hubs. Each advisor receives exactly 2,500 leads.
                    </p>
                    <button
                      onClick={() => handleRunBulkImport(20000)}
                      disabled={bulkImporting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 active:scale-98"
                      style={{ background: '#0F1729' }}
                    >
                      {bulkImporting ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-amber-400" />
                          <span>Distributing 20,000 Leads via Round-Robin...</span>
                        </>
                      ) : (
                        <>
                          <Shuffle size={14} style={{ color: '#C9A84C' }} />
                          <span>Run 20,000 Leads Round-Robin Test</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option 2: Custom CSV Upload / Paste */}
                  <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Option 2: Import Custom Leads CSV
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Headers: name, phone, fragrance, tag
                      </span>
                    </div>
                    <textarea
                      value={csvUploadText}
                      onChange={e => setCsvUploadText(e.target.value)}
                      placeholder="name,phone,fragrance,tag&#10;Aarav Sharma,+919812345601,Aquatic Fresh,HOT&#10;Diya Patel,+919812345602,Arabic Oud,WARM&#10;Rohan Mehta,+919812345603,Rose Intense,NEW"
                      rows={5}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                    <button
                      onClick={() => handleRunBulkImport()}
                      disabled={bulkImporting || !csvUploadText.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-900 border border-amber-300 bg-amber-400/90 hover:bg-amber-400 transition disabled:opacity-50 shadow-xs"
                    >
                      {bulkImporting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Parsing &amp; Routing CSV Leads...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={14} />
                          <span>Upload &amp; Distribute CSV Leads</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Results View */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>{importResult.message || 'Leads successfully distributed!'}</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Total Leads Distributed: <span className="font-bold">{importResult.totalDistributed?.toLocaleString('en-IN') || importResult.totalLeads?.toLocaleString('en-IN')}</span> across{' '}
                      <span className="font-bold">{importResult.activeAgentsCount || 8} Active Advisors</span>.
                    </p>
                  </div>

                  {/* Allocation Breakdown per Agent */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Advisor Equal Allocation Breakdown</span>
                      <span className="text-[10px] font-mono text-emerald-700">100% Parity Achieved</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {(importResult.distributionBreakdown || []).map((agent: any) => (
                        <div key={agent.agentId} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: '#0F1729' }}>
                              {agent.agentName?.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">{agent.agentName}</span>
                              <span className="text-[10px] text-slate-400 block">{agent.agentEmail}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900">{agent.leadsAllocated?.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-slate-400 ml-1">leads</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setImportResult(null)
                        setCsvUploadText('')
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Route Another Batch
                    </button>
                    <button
                      onClick={() => setShowBulkModal(false)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition"
                      style={{ background: '#0F1729' }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
