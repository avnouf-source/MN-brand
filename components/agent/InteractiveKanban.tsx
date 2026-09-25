'use client'
import { useState } from 'react'
import { Phone, ArrowRight, ArrowLeft, GripVertical, CheckCircle, Clock, Sparkles } from 'lucide-react'
import { parsePhone, formatPhoneDisplay, telLink, getCountryLocalTime } from '@/lib/countries'
import { calculatePredictiveScore } from '@/lib/ai-scoring'
import type { Lead } from './AgentWorkspace'

interface Props {
  leads: Lead[]
  onSelect: (lead: Lead) => void
  selectedId?: string
  onUpdate: (lead: Lead) => void
}

const COLUMNS = [
  { id: 'NEW_INQUIRY', label: 'New Inquiry', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'SCENT_RECOMMENDATION', label: 'Scent Recommendation', color: '#C9A84C', bg: '#FDF6E3', border: '#fef08a' },
  { id: 'ORDER_PLACED', label: 'Order Placed', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  { id: 'SHIPPED', label: 'Shipped', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { id: 'DELIVERED', label: 'Delivered', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
]

function normalizeStage(stage: string): string {
  if (stage === 'NEW') return 'NEW_INQUIRY'
  if (stage === 'TALKING') return 'SCENT_RECOMMENDATION'
  if (stage === 'DONE') return 'DELIVERED'
  return stage
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  HOT: { bg: '#fee2e2', text: '#ef4444' },
  WARM: { bg: '#fef3c7', text: '#d97706' },
  COLD: { bg: '#e0f2fe', text: '#0284c7' },
  NONE: { bg: '#f1f5f9', text: '#64748b' },
}

export function InteractiveKanban({ leads, onSelect, selectedId, onUpdate }: Props) {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  async function moveLeadStage(lead: Lead, nextStage: string) {
    if (lead.stage === nextStage) return
    const updatedLead: Lead = { ...lead, stage: nextStage, updatedAt: new Date().toISOString() }
    onUpdate(updatedLead)

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      })
    } catch (err) {
      console.warn('Failed to persist lead stage update:', err)
    }
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id)
    setDraggedLeadId(id)
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault()
    setDragOverCol(colId)
  }

  function handleDrop(e: React.DragEvent, targetColId: string) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId
    setDraggedLeadId(null)
    setDragOverCol(null)

    if (!leadId) return
    const lead = leads.find(l => l.id === leadId)
    if (lead && lead.stage !== targetColId) {
      moveLeadStage(lead, targetColId)
    }
  }

  return (
    <div className="flex-1 overflow-x-auto p-4 bg-slate-100/60 min-h-0">
      <div className="flex gap-4 min-w-[1000px] h-full items-start">
        {COLUMNS.map((col, colIdx) => {
          const colLeads = leads.filter(l => normalizeStage(l.stage) === col.id)
          const isOver = dragOverCol === col.id

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              className={`flex-1 flex flex-col rounded-2xl border transition-all max-h-full h-full ${
                isOver ? 'ring-2 ring-amber-400 bg-amber-50/20' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              {/* Column Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between rounded-t-2xl bg-white"
                style={{ borderColor: col.border }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: col.bg, color: col.color }}
                >
                  {colLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {colLeads.map(lead => {
                  const { country } = parsePhone(lead.phone)
                  const localTime = getCountryLocalTime(country ?? lead.phone)
                  const score = calculatePredictiveScore(lead)
                  const tagStyle = TAG_COLORS[lead.tag] || TAG_COLORS.NONE
                  const isSelected = selectedId === lead.id
                  const msgs = lead.conversation?.messages ?? []
                  const lastMsg = msgs[msgs.length - 1]

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={e => handleDragStart(e, lead.id)}
                      className={`group relative bg-white rounded-xl border p-3 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                        isSelected ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Name + Drag handle + Calling */}
                      <div className="flex items-start justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => onSelect(lead)}
                          className="flex items-center gap-1.5 text-left font-semibold text-xs text-slate-800 hover:text-amber-600 truncate flex-1"
                        >
                          <GripVertical size={13} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                          <span className="truncate">{lead.name}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ background: score.bg, color: score.color }}
                            title={`AI Score: ${score.score}% (${score.label})`}
                          >
                            🎯 {score.score}%
                          </span>
                          {lead.tag !== 'NONE' && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                              style={{ background: tagStyle.bg, color: tagStyle.text }}
                            >
                              {lead.tag}
                            </span>
                          )}
                          <a
                            href={telLink(lead.phone)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                            title={`Call ${lead.name}`}
                          >
                            <Phone size={12} style={{ color: '#C9A84C' }} />
                          </a>
                        </div>
                      </div>

                      {/* Phone & Country & Local Time Sleep status */}
                      <div
                        onClick={() => onSelect(lead)}
                        className="flex items-center gap-1.5 mt-1 cursor-pointer flex-wrap"
                      >
                        {country && <span className="text-xs leading-none">{country.flag}</span>}
                        <span className="text-[11px] font-mono text-slate-500">{formatPhoneDisplay(lead.phone)}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded-full font-medium"
                          style={{ background: localTime.bg, color: localTime.color }}
                          title={`${localTime.timezoneName} · ${localTime.status === 'SLEEP_HOURS' ? 'Client Sleeping' : 'Business Hours'}`}
                        >
                          {localTime.status === 'SLEEP_HOURS' ? '🌙' : '🟢'} {localTime.timeString}
                        </span>
                      </div>

                      {/* Company & requirement */}
                      {lead.company && (
                        <p
                          onClick={() => onSelect(lead)}
                          className="text-[11px] text-slate-600 mt-1 font-medium truncate cursor-pointer"
                        >
                          🏢 {lead.company}
                        </p>
                      )}

                      {lastMsg && (
                        <p
                          onClick={() => onSelect(lead)}
                          className="text-[10px] text-slate-400 mt-1 truncate cursor-pointer"
                        >
                          💬 {lastMsg.body}
                        </p>
                      )}

                      {/* Stage Movement Controls */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        {colIdx > 0 ? (
                          <button
                            type="button"
                            onClick={() => moveLeadStage(lead, COLUMNS[colIdx - 1].id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 text-[10px] font-medium text-slate-500 transition"
                            title={`Move back to ${COLUMNS[colIdx - 1].label}`}
                          >
                            <ArrowLeft size={10} />
                            <span>{COLUMNS[colIdx - 1].label.split(' ')[0]}</span>
                          </button>
                        ) : <div />}

                        {colIdx < COLUMNS.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => moveLeadStage(lead, COLUMNS[colIdx + 1].id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-amber-50 text-[10px] font-semibold text-slate-700 hover:text-amber-800 transition border border-slate-200"
                            title={`Advance to ${COLUMNS[colIdx + 1].label}`}
                          >
                            <span>{COLUMNS[colIdx + 1].label.split(' ')[0]}</span>
                            <ArrowRight size={10} style={{ color: '#C9A84C' }} />
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <CheckCircle size={11} /> Won
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {colLeads.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    Drag leads here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
