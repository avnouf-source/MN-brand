// WhatsApp Business-Style System Lead Labels
export type LeadLabelType = 'NEW_LEAD' | 'FOLLOW_UP' | 'IMPORTANT' | 'CONVERTED' | 'LOST'

export interface LeadLabelConfig {
  id: LeadLabelType
  label: string
  emoji: string
  color: string
  bg: string
  border: string
  dot: string
  description: string
}

export const SYSTEM_LEAD_LABELS: Record<LeadLabelType, LeadLabelConfig> = {
  NEW_LEAD: {
    id: 'NEW_LEAD',
    label: 'New Lead',
    emoji: '🔵',
    color: '#1D4ED8',      // Blue-700
    bg: '#EFF6FF',         // Blue-50
    border: '#BFDBFE',     // Blue-200
    dot: '#3B82F6',        // Blue-500
    description: 'Freshly assigned inbound client inquiry',
  },
  FOLLOW_UP: {
    id: 'FOLLOW_UP',
    label: 'Follow-up',
    emoji: '🟡',
    color: '#B45309',      // Amber-700
    bg: '#FEF3C7',         // Amber-50
    border: '#FDE68A',     // Amber-200
    dot: '#F59E0B',        // Amber-500
    description: 'Awaiting client response or scheduled consult',
  },
  IMPORTANT: {
    id: 'IMPORTANT',
    label: 'Important',
    emoji: '⭐',
    color: '#92400E',      // Gold-800
    bg: '#FFFBEB',         // Amber-50/warm gold
    border: '#FCD34D',     // Gold-300
    dot: '#C9A84C',        // Luxury Gold
    description: 'High-priority VIP / Hot fragrance buyer',
  },
  CONVERTED: {
    id: 'CONVERTED',
    label: 'Converted',
    emoji: '🟢',
    color: '#047857',      // Emerald-700
    bg: '#ECFDF5',         // Emerald-50
    border: '#A7F3D0',     // Emerald-200
    dot: '#10B981',        // Emerald-500
    description: 'Order confirmed and successfully processed',
  },
  LOST: {
    id: 'LOST',
    label: 'Lost',
    emoji: '⚫',
    color: '#475569',      // Slate-600
    bg: '#F1F5F9',         // Slate-100
    border: '#CBD5E1',     // Slate-300
    dot: '#64748B',        // Slate-500
    description: 'Not interested / Unresponsive / Budget mismatch',
  },
}

export const SYSTEM_LABEL_KEYS: LeadLabelType[] = [
  'NEW_LEAD',
  'FOLLOW_UP',
  'IMPORTANT',
  'CONVERTED',
  'LOST',
]

/**
 * Derives the active system label for any lead, supporting legacy tags/stages as fallback
 */
export function getLeadSystemLabel(lead: {
  label?: string | null
  tag?: string | null
  stage?: string | null
}): LeadLabelConfig {
  if (lead.label && SYSTEM_LEAD_LABELS[lead.label as LeadLabelType]) {
    return SYSTEM_LEAD_LABELS[lead.label as LeadLabelType]
  }

  // Fallback heuristic based on stage and tag
  if (lead.tag === 'HOT') return SYSTEM_LEAD_LABELS.IMPORTANT
  if (lead.stage === 'DONE' || lead.stage === 'ORDER_PLACED' || lead.stage === 'CONVERTED') {
    return SYSTEM_LEAD_LABELS.CONVERTED
  }
  if (lead.tag === 'COLD' || lead.stage === 'LOST') {
    return SYSTEM_LEAD_LABELS.LOST
  }
  if (lead.stage === 'TALKING' || lead.tag === 'WARM') {
    return SYSTEM_LEAD_LABELS.FOLLOW_UP
  }

  return SYSTEM_LEAD_LABELS.NEW_LEAD
}
