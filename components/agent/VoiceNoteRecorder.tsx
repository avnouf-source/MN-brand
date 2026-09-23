'use client'
import { useState, useEffect } from 'react'
import { Mic, Square, Send, Trash2 } from 'lucide-react'

interface Props {
  onSend: (duration: string) => void
  onCancel: () => void
}

export function VoiceNoteRecorder({ onSend, onCancel }: Props) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function handleSend() {
    const durationStr = formatTime(seconds || 1)
    onSend(durationStr)
  }

  return (
    <div className="flex items-center gap-3 w-full bg-slate-900 text-white px-4 py-2.5 rounded-2xl animate-in fade-in duration-150">
      {/* Recording Indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="font-mono text-xs font-semibold text-red-400">REC</span>
        <span className="font-mono text-xs font-bold text-white tracking-wider">{formatTime(seconds)}</span>
      </div>

      {/* Animated Sound Wave Bars */}
      <div className="flex-1 flex items-center justify-center gap-1 h-5 px-3">
        {[40, 80, 60, 100, 75, 45, 90, 60, 85, 50, 70, 95].map((h, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-[#C9A84C] animate-pulse"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '600ms',
            }}
          />
        ))}
      </div>

      {/* Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
        title="Discard recording"
      >
        <Trash2 size={16} />
      </button>

      {/* Send Voice Note button */}
      <button
        type="button"
        onClick={handleSend}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 transition active:scale-95 shadow-xs"
        style={{ background: '#C9A84C' }}
        title="Send Voice Note"
      >
        <Send size={13} />
        <span>Send</span>
      </button>
    </div>
  )
}
