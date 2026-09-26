import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface AgentMetric {
  name: string
  email: string
  assigned: number
  contacted: number
  converted: number
  lostLeads: number
  conversionRate: string
  revenueINR: number
  speed?: string
  status?: string
}

export interface ReportSummary {
  period: string
  totalAssigned: number
  totalContacted: number
  totalConverted: number
  totalLost: number
  averageConversionRate: string
  totalRevenueINR: number
  currency: string
}

export function generateExecutiveReportPDF({
  summary,
  agents,
}: {
  summary: ReportSummary
  agents: AgentMetric[]
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // 1. Luxury Header Banner (Deep Midnight Navy)
  doc.setFillColor(10, 15, 29) // #0A0F1D
  doc.rect(0, 0, pageWidth, 42, 'F')

  // Gold Accent Hairline (#C9A84C)
  doc.setFillColor(201, 168, 76)
  doc.rect(0, 42, pageWidth, 1.5, 'F')

  // Header Title
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text('B PERFUME', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(201, 168, 76) // Gold
  doc.text('HAUTE PARFUMERIE · EXECUTIVE AUDIT', 14, 25)

  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225) // Slate-300
  doc.text('Super Admin Confidential Report · Performance & Conversion Intelligence', 14, 32)

  // Header Right Metadata
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(`Generated: ${timestamp} IST`, pageWidth - 14, 18, { align: 'right' })
  doc.setTextColor(203, 213, 225)
  doc.text(`Authorized by: Super Admin (admin@bperfume.com)`, pageWidth - 14, 24, { align: 'right' })
  doc.text(`Period: ${summary.period}`, pageWidth - 14, 30, { align: 'right' })

  // 2. Executive KPI Overview Box
  doc.setFillColor(248, 250, 252) // slate-50
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.roundedRect(14, 49, pageWidth - 28, 28, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text('Executive KPI Summary', 20, 56)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139) // slate-500

  const colWidth = (pageWidth - 36) / 5
  const kpis = [
    { label: 'Total Assigned', val: summary.totalAssigned.toLocaleString('en-IN') },
    { label: 'Leads Contacted', val: summary.totalContacted.toLocaleString('en-IN') },
    { label: 'Converted Orders', val: summary.totalConverted.toLocaleString('en-IN') },
    { label: 'Lost Leads', val: summary.totalLost.toLocaleString('en-IN') },
    { label: 'Team Conversion', val: summary.averageConversionRate },
  ]

  kpis.forEach((kpi, idx) => {
    const x = 20 + idx * colWidth
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(kpi.label, x, 63)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(10, 15, 29)
    doc.text(kpi.val, x, 71)
  })

  // 3. Agent Performance Tracking Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text('Real-Time Sales Agent Performance Matrix', 14, 86)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('Real-time workload distribution, conversion ratios, and lost opportunity tracking across active sales advisors.', 14, 91)

  const tableRows = agents.map((a, idx) => [
    `#${idx + 1}`,
    a.name,
    a.email,
    a.assigned.toLocaleString('en-IN'),
    a.contacted.toLocaleString('en-IN'),
    a.converted.toLocaleString('en-IN'),
    a.lostLeads.toLocaleString('en-IN'),
    a.conversionRate,
    `INR ${a.revenueINR.toLocaleString('en-IN')}`,
    a.status || 'Active',
  ])

  autoTable(doc, {
    startY: 95,
    margin: { left: 14, right: 14 },
    head: [[
      'Rank',
      'Agent Specialist',
      'Corporate Email',
      'Assigned',
      'Contacted',
      'Converted',
      'Lost Leads',
      'Conv. Rate',
      'Revenue',
      'Status',
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [10, 15, 29], // #0A0F1D
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [241, 245, 249],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right', textColor: [4, 120, 87] }, // Green
      6: { halign: 'right', textColor: [100, 116, 139] }, // Gray
      7: { halign: 'right', fontStyle: 'bold', textColor: [180, 83, 9] }, // Amber
      8: { halign: 'right' },
      9: { halign: 'center' },
    },
  })

  // 4. Luxury Footer Sign-off
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setDrawColor(226, 232, 240)
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('© 2025 B Perfume Haute Parfumerie International · Executive Management Gateway', 14, pageHeight - 14)
  doc.text('Page 1 of 1 · Super Admin Verified', pageWidth - 14, pageHeight - 14, { align: 'right' })

  // Trigger Instant Client Download
  const cleanDate = new Date().toISOString().split('T')[0]
  doc.save(`B_Perfume_Executive_Report_${cleanDate}.pdf`)
}
