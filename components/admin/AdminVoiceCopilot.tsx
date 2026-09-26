'use client'
import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Send, Bot, Loader2, Play, Square } from 'lucide-react'

interface Message {
  id: string
  role: 'admin' | 'copilot'
  content: string
  timestamp: string
}

export function AdminVoiceCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'copilot',
      content:
        'Good day, Super Admin Nouf. I am your B Perfume Executive Voice Copilot. You may speak to me or type to query live CRM sales performance across our 5,000 Indian leads and 8 advisors.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [voiceMuted, setVoiceMuted] = useState(false)

  const recognitionRef = useRef<any>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSpeaking])

  // Setup Web Speech Recognition (Speech-to-Text)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setIsListening(false)
          if (transcript.trim()) {
            handleSendMessage(transcript)
          }
        }

        recognition.onerror = (event: any) => {
          console.warn('[Web Speech Recognition Error]:', event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
      stopVoiceAudio()
    }
  }, [])

  function toggleListening() {
    stopVoiceAudio()
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
      } catch (err) {
        console.warn('Could not start microphone:', err)
        setIsListening(false)
      }
    }
  }

  function stopVoiceAudio() {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  // Playback realistic female voice using ElevenLabs API or Web Speech fallback
  async function speakResponse(text: string) {
    if (voiceMuted) return
    stopVoiceAudio()
    setIsSpeaking(true)

    try {
      const res = await fetch('/api/admin/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const contentType = res.headers.get('content-type') || ''

      if (res.ok && contentType.includes('audio')) {
        const blob = await res.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        audioPlayerRef.current = audio

        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          fallbackWebSpeech(text)
        }

        await audio.play()
        return
      }

      // Fallback to high-quality browser female speech synthesis
      fallbackWebSpeech(text)
    } catch (e) {
      console.warn('[TTS Playback]: Falling back to Web Speech', e)
      fallbackWebSpeech(text)
    }
  }

  function fallbackWebSpeech(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text
      .replace(/[#*`_~\[\]]/g, '')
      .replace(/\n+/g, '. ')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 0.95
    utterance.pitch = 1.1 // Slightly higher pitch for smooth female timbre

    // Attempt to pick a natural female voice
    const voices = window.speechSynthesis.getVoices()
    const femaleVoice =
      voices.find(v => (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google UK English Female') || v.name.includes('Zira') || v.name.includes('Karen')) && v.lang.startsWith('en')) ||
      voices.find(v => v.lang.startsWith('en'))

    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  async function handleSendMessage(overrideText?: string) {
    const queryText = (overrideText || input).trim()
    if (!queryText || isLoading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'admin',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!overrideText) setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryText, action: 'custom' }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiAnswer = data.answer || 'Analysis complete for your luxury CRM inquiry.'
        const copilotMsg: Message = {
          id: `copilot-${Date.now()}`,
          role: 'copilot',
          content: aiAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, copilotMsg])

        // Automatically synthesize female voice playback
        speakResponse(aiAnswer)
      } else {
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: 'copilot',
          content: 'I apologize, but I encountered a momentary telemetry lag. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, errMsg])
      }
    } catch (err: any) {
      console.error('[Copilot Voice Query Error]:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #0A0F1D 0%, #1E293B 100%)',
            border: '1.5px solid #C9A84C',
            boxShadow: '0 10px 25px -5px rgba(201, 168, 76, 0.35)',
          }}
          title="Open Voice-Activated AI Copilot"
        >
          <div className="relative">
            <Bot size={20} className="text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-bold text-amber-200 tracking-wide font-serif hidden sm:inline">
            Admin AI Voice Copilot
          </span>
        </button>
      </div>

      {/* Glassmorphic AI Copilot Voice Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-xl bg-slate-900/95 border border-amber-400/30 rounded-3xl shadow-2xl flex flex-col h-[640px] overflow-hidden text-slate-100"
            style={{
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px -12px rgba(10, 15, 29, 0.7), 0 0 30px rgba(201, 168, 76, 0.15)',
            }}
          >
            {/* Header with Female Voice Persona Indicator */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border border-amber-400/40 relative"
                  style={{ background: '#0A0F1D' }}
                >
                  <Bot size={22} className="text-amber-400" />
                  {isSpeaking && (
                    <span className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-serif tracking-wide">
                      B Perfume Executive AI Copilot
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      GPT-4o &amp; ElevenLabs
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/70 flex items-center gap-1.5 mt-0.5">
                    <span>Professional Female Voice</span>
                    <span>•</span>
                    <span className={isSpeaking ? 'text-emerald-400 font-semibold animate-pulse' : 'text-slate-400'}>
                      {isSpeaking ? 'Speaking reply...' : 'Listening ready'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Audio Controls & Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isSpeaking) stopVoiceAudio()
                    setVoiceMuted(!voiceMuted)
                  }}
                  className={`p-2 rounded-xl border transition ${
                    voiceMuted
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-white/5 text-amber-300 border-white/10 hover:bg-white/10'
                  }`}
                  title={voiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                >
                  {voiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button
                  onClick={() => {
                    stopVoiceAudio()
                    setIsOpen(false)
                  }}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {[
                'Forecast our monthly revenue',
                'Which advisor has top conversion?',
                'Summarize 5,000 leads status',
                'Check at-risk VIP clients',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-amber-400/20 text-amber-200/90 border border-amber-400/20 transition disabled:opacity-50 text-[10px]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Conversation Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'admin' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      m.role === 'admin'
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs shadow-md'
                        : 'bg-slate-800/90 text-slate-200 border border-white/10 rounded-tl-xs shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                        m.role === 'admin' ? 'text-slate-900/70' : 'text-slate-400'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {m.role === 'copilot' && (
                        <button
                          onClick={() => speakResponse(m.content)}
                          className="hover:text-amber-400 transition ml-2"
                          title="Replay female voice"
                        >
                          <Play size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-2xl border border-white/5 w-fit">
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                  <span className="text-xs text-amber-200/80">Analyzing live CRM telemetry...</span>
                </div>
              )}

              {/* Dynamic Waveform Visualizer during Speech */}
              {isSpeaking && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-400/10 border border-amber-400/30 rounded-xl text-xs text-amber-300 w-fit">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span>ElevenLabs Female Voice Active</span>
                  <button
                    onClick={stopVoiceAudio}
                    className="ml-2 p-1 rounded-sm hover:bg-amber-400/20 text-amber-200"
                    title="Stop playback"
                  >
                    <Square size={10} />
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar with Speech-to-Text Mic Button */}
            <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-white/10 flex items-center gap-2">
              {/* Mic Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/40'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Tap to speak to AI Copilot'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                placeholder={isListening ? 'Listening to your voice...' : 'Ask your AI Fragrance Copilot...'}
                className="flex-1 bg-slate-800/90 border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400 transition"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 flex items-center justify-center transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
