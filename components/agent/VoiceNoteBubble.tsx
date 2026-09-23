'use client'
import { useState, useEffect } from 'react'
import { Play, Pause, Mic } from 'lucide-react'

interface Props {
  duration?: string
  senderType?: string
  direction: 'INBOUND' | 'OUTBOUND'
  timestamp: string
}

export function VoiceNoteBubble({ duration = '0:14', direction, timestamp }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 5
        })
      }, 250)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  const isOutbound = direction === 'OUTBOUND'

  // Pre-calculated audio waveform bar heights
  const waveformBars = [
    30, 60, 45, 80, 100, 70, 50, 90, 65, 40, 75, 95, 85, 60, 40, 70, 80, 55, 90, 60, 45, 30
  ]

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2 max-w-xs shadow-xs"
      style={{
        background: isOutbound ? '#0F1729' : '#FFFFFF',
        color: isOutbound ? '#FFFFFF' : '#334155',
        border: isOutbound ? 'none' : '1px solid #E2E8F0',
        borderRadius: isOutbound ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 active:scale-95"
          style={{
            background: isOutbound ? '#C9A84C' : '#0F1729',
            color: '#FFFFFF',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Audio Waveform & Scrubber */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-center gap-1 h-7">
            {waveformBars.map((height, i) => {
              const barPercent = (i / waveformBars.length) * 100
              const isActive = barPercent <= progress
              return (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-150"
                  style={{
                    height: `${height}%`,
                    background: isActive
                      ? isOutbound
                        ? '#C9A84C'
                        : '#0F1729'
                      : isOutbound
                      ? 'rgba(255,255,255,0.25)'
                      : '#CBD5E1',
                  }}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between text-[10px]" style={{ opacity: 0.75 }}>
            <span className="font-mono">{isPlaying ? `${Math.round((progress / 100) * 14)}s` : duration}</span>
            <div className="flex items-center gap-1">
              <Mic size={10} style={{ color: isOutbound ? '#C9A84C' : '#64748B' }} />
              <span>Voice Note</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <span
          className="text-[9px]"
          style={{ color: isOutbound ? 'rgba(255,255,255,0.45)' : '#94A3B8' }}
        >
          {timestamp}
        </span>
      </div>
    </div>
  )
}
