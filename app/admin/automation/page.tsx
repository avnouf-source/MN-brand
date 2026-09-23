'use client'
import { useState } from 'react'
import { VisualWorkflowBuilder } from '@/components/admin/VisualWorkflowBuilder'
import { BotBuilder } from '@/components/admin/BotBuilder'
import { GitBranch, Bot } from 'lucide-react'

export default function AutomationPage() {
  const [tab, setTab] = useState<'canvas' | 'bot'>('canvas')

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setTab('canvas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            tab === 'canvas'
              ? 'text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
          style={{ background: tab === 'canvas' ? '#0F1729' : undefined }}
        >
          <GitBranch size={14} style={{ color: tab === 'canvas' ? '#C9A84C' : undefined }} />
          <span>Visual Workflow Canvas (HubSpot / Zapier Standard)</span>
        </button>

        <button
          onClick={() => setTab('bot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            tab === 'bot'
              ? 'text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
          style={{ background: tab === 'bot' ? '#0F1729' : undefined }}
        >
          <Bot size={14} style={{ color: tab === 'bot' ? '#C9A84C' : undefined }} />
          <span>WhatsApp Bot & AI Auto-Reply</span>
        </button>
      </div>

      {tab === 'canvas' ? <VisualWorkflowBuilder /> : <BotBuilder />}
    </div>
  )
}
