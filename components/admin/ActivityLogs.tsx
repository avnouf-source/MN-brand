'use client'
import { useState, useMemo } from 'react'
import { Search, Download, Shield, Filter, AlertTriangle, CheckCircle, Clock, Users, ArrowUpRight } from 'lucide-react'
import { generate50Agents } from '@/lib/bulk-generator'

export interface LogEntry {
  id: string
  timestamp: string
  agentName: string
  agentDepartment: string
  action: string
  target: string
  severity: 'INFO' | 'WARNING' | 'SECURITY'
  ipAddress: string
  location: string
}

export function generateInitialLogs(): LogEntry[] {
  const agents = generate50Agents()
  const actions = [
    { action: 'Staff Authentication', target: 'SSO Login Session', severity: 'INFO' as const },
    { action: 'Lead Stage Transition', target: 'Advanced Lead #821 to ORDER_PLACED', severity: 'INFO' as const },
    { action: 'WhatsApp Audio Dispatched', target: 'Voice Note (0:24) sent to Lead #412', severity: 'INFO' as const },
    { action: 'SLA Escalation Reassignment', target: 'Lead #108 reassigned (15m SLA Breach)', severity: 'WARNING' as const },
    { action: 'GDPR Right to be Forgotten', target: 'Customer record anonymized upon request', severity: 'SECURITY' as const },
    { action: 'Bulk Template Broadcast', target: 'Sent welcome_international_lead to 40 contacts', severity: 'INFO' as const },
    { action: 'Deal Finalized', target: 'Marked Lead #304 as DONE ($4,500 ACV)', severity: 'INFO' as const },
    { action: 'Unusual Login Location', target: 'Login from unrecognized IP address', severity: 'SECURITY' as const },
    { action: 'Internal Note Added', target: 'VIP Customization requirements noted', severity: 'INFO' as const },
    { action: 'Contact Details Exported', target: 'Exported pipeline batch for regional review', severity: 'WARNING' as const },
  ]

  const logs: LogEntry[] = []
  const now = Date.now()

  for (let i = 1; i <= 60; i++) {
    const ag = agents[(i * 3) % agents.length]
    const act = actions[i % actions.length]
    const minutesAgo = i * 14
    const ts = new Date(now - minutesAgo * 60000).toISOString()

    logs.push({
      id: `log-${i}`,
      timestamp: ts,
      agentName: ag.name,
      agentDepartment: ag.department,
      action: act.action,
      target: act.target,
      severity: act.severity,
      ipAddress: `185.${120 + (i % 50)}.${10 + (i % 80)}.${2 + (i % 200)}`,
      location: i % 3 === 0 ? 'Dubai, UAE' : i % 3 === 1 ? 'London, UK' : 'Riyadh, KSA',
    })
  }

  return logs
}

export function ActivityLogs() {
  const [logs] = useState<LogEntry[]>(generateInitialLogs)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (severityFilter !== 'ALL' && l.severity !== severityFilter) return false
      if (deptFilter !== 'ALL' && l.agentDepartment !== deptFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          l.agentName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.target.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logs, search, severityFilter, deptFilter])

  function exportCSV() {
    const headers = ['Timestamp', 'Staff Name', 'Department', 'Action', 'Target', 'Severity', 'IP Address', 'Location']
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `"${l.agentName}"`,
      `"${l.agentDepartment}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      l.severity,
      l.ipAddress,
      `"${l.location}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `MN_Brand_Audit_Logs_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function exportJSON() {
    const jsonStr = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `MN_Brand_Audit_Logs_${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const severityBadge = (sev: LogEntry['severity']) => {
    switch (sev) {
      case 'SECURITY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">SECURITY</span>
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">WARNING</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">INFO</span>
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ background: '#0F1729' }}>
              <Shield size={16} style={{ color: '#C9A84C' }} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">System Activity Logs & Enterprise Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time immutable audit trail monitoring all actions, authentication events, and stage transitions across 50 staff members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs"
          >
            <Download size={13} style={{ color: '#C9A84C' }} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition"
            style={{ background: '#0F1729' }}
          >
            <ArrowUpRight size={13} style={{ color: '#C9A84C' }} />
            <span>SIEM JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400">Total Logged Events</span>
          <p className="text-xl font-bold text-slate-800 mt-1">{logs.length} Actions</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">● 100% Audit Coverage</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400">Active Staff Monitored</span>
          <p className="text-xl font-bold text-slate-800 mt-1">50 Agents</p>
          <p className="text-[10px] text-slate-400 mt-0.5">5 Global Divisions</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400">Security Events</span>
          <p className="text-xl font-bold text-purple-700 mt-1">
            {logs.filter(l => l.severity === 'SECURITY').length} Recorded
          </p>
          <p className="text-[10px] text-purple-600 mt-0.5">Verified Compliant</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400">SLA Escalations</span>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {logs.filter(l => l.severity === 'WARNING').length} Dispatched
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">15-minute response rule</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff, action, IP, location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 placeholder-slate-400"
            style={{ '--tw-ring-color': '#C9A84C' } as any}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Severity selector */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Info Only</option>
            <option value="WARNING">Warnings (SLA)</option>
            <option value="SECURITY">Security & GDPR</option>
          </select>

          {/* Department selector */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Enterprise">Enterprise</option>
            <option value="VIP Accounts">VIP Accounts</option>
            <option value="Support">Support</option>
            <option value="Business Dev">Business Dev</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Action / Event</th>
                <th className="py-3.5 px-4">Target Detail</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">IP & Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const dateObj = new Date(log.timestamp)
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      <div>{timeStr}</div>
                      <div className="text-[10px] text-slate-400">{dateStr}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{log.agentName}</div>
                      <span className="text-[10px] text-slate-400">{log.agentDepartment}</span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={log.target}>
                      {log.target}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {severityBadge(log.severity)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-600">{log.ipAddress}</div>
                      <div className="text-[10px] text-slate-400">{log.location}</div>
                    </td>
                  </tr>
                )
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No log records match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
