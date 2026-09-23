'use client'
import { useState } from 'react'
import { GitBranch, Zap, Sparkles, Plus, ArrowRight, Play, CheckCircle2, Sliders, ToggleLeft, ToggleRight, Trash2, Bot, Bell, Shield, ArrowDown } from 'lucide-react'

export interface WorkflowRule {
  id: string
  name: string
  description: string
  isActive: boolean
  trigger: {
    event: string
    detail: string
  }
  conditions: {
    field: string
    operator: string
    value: string
  }[]
  action: {
    type: string
    payload: string
  }
  executionCount: number
}

const DEFAULT_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'wf-1',
    name: 'VIP High-Probability Deal Fast-Track',
    description: 'Instantly dispatches tailored proposal when AI predictive lead score exceeds 80.',
    isActive: true,
    trigger: { event: 'Lead Score Calculated', detail: 'Score > 80' },
    conditions: [
      { field: 'Lead Score', operator: '>', value: '80' },
      { field: 'Country Code', operator: 'IN', value: 'AE, SA, US, UK' },
      { field: 'Inactivity Time', operator: '>', value: '2 hours' },
    ],
    action: {
      type: 'Send WhatsApp Template',
      payload: 'order_proposal_confirmation with 15% VIP incentive',
    },
    executionCount: 142,
  },
  {
    id: 'wf-2',
    name: '15-Minute SLA Breach Auto-Escalation',
    description: 'Guarantees sub-15 minute response on high-priority inquiries by reassigning to available managers.',
    isActive: true,
    trigger: { event: 'Customer Inbound Message', detail: 'Unanswered > 15m' },
    conditions: [
      { field: 'Lead Tag', operator: 'EQUALS', value: 'HOT' },
      { field: 'Agent Response Time', operator: '>', value: '15 minutes' },
    ],
    action: {
      type: 'Reassign & Escalate',
      payload: 'Transfer to Online Senior Sales Manager + Push Notification',
    },
    executionCount: 29,
  },
  {
    id: 'wf-3',
    name: '48-Hour Dormant WhatsApp Reactivation',
    description: 'Detects stalled negotiations and dispatches follow-up sequences automatically.',
    isActive: true,
    trigger: { event: 'Lead Inactive Timer', detail: 'Time > 48 hours' },
    conditions: [
      { field: 'Pipeline Stage', operator: 'EQUALS', value: 'TALKING' },
      { field: 'Last Message Direction', operator: 'EQUALS', value: 'OUTBOUND' },
    ],
    action: {
      type: 'Send Automated Sequence',
      payload: 'Trigger dormant_reengagement_24h template',
    },
    executionCount: 388,
  },
]

export function VisualWorkflowBuilder() {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(DEFAULT_WORKFLOWS)
  const [selectedWf, setSelectedWf] = useState<WorkflowRule>(DEFAULT_WORKFLOWS[0])
  const [showNewModal, setShowNewModal] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState<string | null>(null)

  // New workflow form state
  const [newTitle, setNewTitle] = useState('')
  const [newTrigger, setNewTrigger] = useState('Lead Score > 80')
  const [newCondition, setNewCondition] = useState('Country is UAE or KSA')
  const [newAction, setNewAction] = useState('Send WhatsApp VIP Offer Template')

  function toggleActive(id: string) {
    setWorkflows(prev =>
      prev.map(w => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    )
    if (selectedWf.id === id) {
      setSelectedWf(prev => ({ ...prev, isActive: !prev.isActive }))
    }
  }

  function simulateExecution() {
    setSimulating(true)
    setSimResult(null)
    setTimeout(() => {
      setSimulating(false)
      setSimResult(
        `✅ Simulation Complete: Trigger fired -> Conditions matched (100% pass) -> Action executed: "${selectedWf.action.payload}". Target lead received WhatsApp notification.`
      )
    }, 1000)
  }

  function createWorkflow(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newRule: WorkflowRule = {
      id: `wf-${Date.now()}`,
      name: newTitle,
      description: 'Custom automation flow created in Visual Designer.',
      isActive: true,
      trigger: { event: 'Custom Event', detail: newTrigger },
      conditions: [{ field: 'Rule Filter', operator: 'MATCHES', value: newCondition }],
      action: { type: 'Automated Action', payload: newAction },
      executionCount: 0,
    }

    setWorkflows(prev => [newRule, ...prev])
    setSelectedWf(newRule)
    setShowNewModal(false)
    setNewTitle('')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ background: '#0F1729' }}>
              <GitBranch size={16} style={{ color: '#C9A84C' }} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Visual Workflow Automation Canvas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise drag-and-drop logic builder (Zapier/HubSpot standard) to automate SLA escalations, lead scoring actions, and multi-country routing.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95 self-start sm:self-auto"
          style={{ background: '#0F1729' }}
        >
          <Plus size={14} style={{ color: '#C9A84C' }} />
          <span>New Workflow Chain</span>
        </button>
      </div>

      {/* Main Grid: Left Rules List, Right Visual Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workflow Rules Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Active Logic Chains ({workflows.length})
          </div>

          {workflows.map(wf => (
            <div
              key={wf.id}
              onClick={() => {
                setSelectedWf(wf)
                setSimResult(null)
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs ${
                selectedWf.id === wf.id
                  ? 'border-amber-400 ring-2 ring-amber-300/60'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 leading-snug">{wf.name}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    toggleActive(wf.id)
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {wf.isActive ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-400">
                      PAUSED
                    </span>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{wf.description}</p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{wf.executionCount} executions</span>
                <span style={{ color: '#C9A84C' }}>View Canvas →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Visual Node Flow Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Canvas Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Interactive Canvas
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">{selectedWf.name}</h2>
                <p className="text-xs text-slate-500">{selectedWf.description}</p>
              </div>

              <button
                onClick={simulateExecution}
                disabled={simulating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition shadow-2xs active:scale-95"
              >
                <Play size={12} className={simulating ? 'animate-spin' : ''} style={{ color: '#C9A84C' }} />
                <span>{simulating ? 'Simulating...' : 'Test Run'}</span>
              </button>
            </div>

            {simResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                {simResult}
              </div>
            )}

            {/* Visual Node Diagram (Zapier/HubSpot Style) */}
            <div className="py-2 space-y-4 max-w-xl mx-auto">
              {/* NODE 1: Trigger */}
              <div className="p-4 rounded-2xl border-2 border-violet-200 bg-violet-50/60 shadow-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs">
                      ⚡
                    </div>
                    <span className="text-[11px] font-bold uppercase text-violet-700 tracking-wider">1. Trigger Event</span>
                  </div>
                  <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">REAL-TIME</span>
                </div>
                <p className="text-xs font-bold text-slate-800 pl-8">{selectedWf.trigger.event}</p>
                <p className="text-[11px] text-slate-500 pl-8 mt-0.5">{selectedWf.trigger.detail}</p>
              </div>

              {/* Connector Arrow */}
              <div className="flex justify-center text-slate-300">
                <ArrowDown size={22} className="stroke-[2.5]" />
              </div>

              {/* NODE 2: Condition Filter */}
              <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50 shadow-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">
                      🔀
                    </div>
                    <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">2. Decision Rules (AND)</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">FILTER</span>
                </div>
                <div className="space-y-1.5 pl-8 mt-2">
                  {selectedWf.conditions.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono bg-white/80 p-2 rounded-lg border border-amber-100">
                      <span className="font-semibold text-slate-700">{c.field}</span>
                      <span className="text-amber-600 font-bold">{c.operator}</span>
                      <span className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector Arrow */}
              <div className="flex justify-center text-slate-300">
                <ArrowDown size={22} className="stroke-[2.5]" />
              </div>

              {/* NODE 3: Action */}
              <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 shadow-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                      🚀
                    </div>
                    <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">3. Automated Execution</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">ACTION</span>
                </div>
                <p className="text-xs font-bold text-slate-800 pl-8">{selectedWf.action.type}</p>
                <p className="text-[11px] text-slate-600 pl-8 mt-0.5">{selectedWf.action.payload}</p>
              </div>
            </div>
          </div>

          {/* Canvas Footer */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Enterprise Rule Engine v2.4</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Listening for Live Lead Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Workflow */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create Custom Automation Chain</h3>

            <form onSubmit={createWorkflow} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workflow Title</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. US Enterprise VIP Fast-Action"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trigger Event</label>
                <select
                  value={newTrigger}
                  onChange={e => setNewTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                >
                  <option>Lead Score &gt; 80</option>
                  <option>Customer Unanswered &gt; 15m (SLA Breach)</option>
                  <option>Stage changes to ORDER_PLACED</option>
                  <option>Inbound Inactive &gt; 24h</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Rule</label>
                <input
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  placeholder="e.g. Country is UAE, KSA, or US"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Automated Action</label>
                <select
                  value={newAction}
                  onChange={e => setNewAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                >
                  <option>Send WhatsApp VIP Offer Template</option>
                  <option>Reassign to Senior Manager &amp; Alert</option>
                  <option>Dispatch Webhook to CRM Webhook Endpoint</option>
                  <option>Send 24h Re-engagement Audio Note</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-white text-xs font-semibold"
                  style={{ background: '#0F1729' }}
                >
                  Activate Workflow
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
