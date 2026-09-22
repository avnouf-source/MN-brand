'use client'

interface Props {
  quickReplies: { id: string; title: string; body: string }[]
  onSelect: (body: string) => void
}

export function QuickRepliesPopup({ quickReplies, onSelect }: Props) {
  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Replies</p>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {quickReplies.map((qr, i) => (
          <button
            key={qr.id}
            onClick={() => onSelect(qr.body)}
            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: '#0F1729' }}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">{qr.title}</p>
                <p className="text-xs text-slate-400 truncate">{qr.body}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
