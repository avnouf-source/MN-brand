import { TrainingSandbox } from '@/components/training/TrainingSandbox'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function TrainingHubPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Return to Live Workspace Navigation Bar */}
      <div className="h-11 px-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between text-xs">
        <Link
          href="/agent/workspace"
          className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition"
        >
          <ArrowLeft size={14} />
          <span>Exit to Live CRM Workspace</span>
        </Link>
        <span className="font-mono text-[11px] text-amber-400/80">
          Isolated Environment • Database Untouched
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <TrainingSandbox />
      </div>
    </div>
  )
}
