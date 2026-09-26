'use client'
import { useState, useRef, useEffect, memo } from 'react'
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Send,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  X,
  Languages,
  Tag,
  Zap,
  Info,
} from 'lucide-react'
import {
  SYSTEM_LEAD_LABELS,
  SYSTEM_LABEL_KEYS,
  LeadLabelType,
} from '@/lib/labels'

interface TrainingMessage {
  id: string
  sender: 'client' | 'agent'
  body: string
  time: string
  isVoiceNote?: boolean
  voiceDuration?: string
  malayalamTranscript?: string
  englishTranslation?: string
}

interface PersonaConfig {
  id: 'male' | 'female'
  name: string
  city: string
  phone: string
  avatar: string
  genderLabel: string
  interestProduct: string
  inquiryMalayalam: string
  inquiryEnglish: string
  initialVoiceDuration: string
  speechText: string
  smartPitch: string
}

const PERSONAS: Record<'male' | 'female', PersonaConfig> = {
  male: {
    id: 'male',
    name: 'Rahul Menon',
    city: 'Kochi, Kerala',
    phone: '+91 98460 12345',
    avatar: '👨',
    genderLabel: 'Male Client (Corporate Executive)',
    interestProduct: 'CITYMAN Extrait de Parfum (100ml / 12-Hour)',
    inquiryMalayalam:
      'ഹലോ, നിങ്ങളുടെ CITYMAN പെർഫ്യൂമിന്റെ 12-Hour longevity പറ്റി കേട്ടു. കൊച്ചിയിലെ ക്ലൈമറ്റിൽ ഇത് അത്രയും നേരം നിൽക്കുമോ? 100ml പ്രൈസ് എത്രയാകും? എനിക്ക് അടുത്ത ആഴ്ച ഒരു ബിസിനസ്സ് മീറ്റിംഗ് ഉണ്ട്.',
    inquiryEnglish:
      'Hello, I heard about the 12-Hour longevity of your CITYMAN perfume. Will it last that long in Kochi\'s humid climate? What is the 100ml price? I have a business meeting next week.',
    initialVoiceDuration: '0:22',
    speechText:
      'Hello, I heard about the 12 hour longevity of your Cityman perfume. Will it last in Kochi humidity? What is the price?',
    smartPitch:
      'Hello Mr. Rahul! CITYMAN Extrait de Parfum is formulated with 35% pure fragrance oils specifically engineered to project for 12+ hours even in Kochi\'s tropical humidity. 100ml flacon is ₹4,200 with complimentary express delivery across Kerala.',
  },
  female: {
    id: 'female',
    name: 'Anjali Nair',
    city: 'Calicut, Kerala',
    phone: '+91 94471 98765',
    avatar: '👩',
    genderLabel: 'Female Client (Creative Director)',
    interestProduct: 'Velvet Rose Pour Femme (100ml / Extrait)',
    inquiryMalayalam:
      'ഹലോ B Perfume! എനിക്ക് ഒരു mild, elegant റോസ് ഫ്ലോറൽ പെർഫ്യൂം വേണം. തലവേദന വരാത്ത soft scent ആയിരിക്കണം, എന്നാൽ ഓഫീസിൽ ഫുൾ ഡേ നിൽക്കുകയും വേണം. Velvet Rose ആണോ Honey Dew ആണോ കൂടുതൽ സ്യൂട്ട് ആകുക?',
    inquiryEnglish:
      'Hello B Perfume! I am looking for a mild, elegant rose floral perfume. It must be a soft scent that does not trigger headaches, but still lasts all day at the office. Would Velvet Rose or Honey Dew suit me better?',
    initialVoiceDuration: '0:26',
    speechText:
      'Hello B Perfume! I am looking for a mild, elegant rose perfume that lasts all day without causing headaches. Between Velvet Rose and Honey Dew, which is better?',
    smartPitch:
      'Hello Ms. Anjali! For your preference in an elegant, headache-free scent, Velvet Rose Pour Femme is our masterpiece. Crafted with natural Grasse rose and white musk at pure Extrait concentration, it maintains a subtle, sophisticated cloud for 12 hours without overpowering.',
  },
}

interface Props {
  onClose?: () => void
  isModal?: boolean
}

export const TrainingSandbox = memo(function TrainingSandbox({ onClose, isModal = false }: Props) {
  const [activePersonaKey, setActivePersonaKey] = useState<'male' | 'female'>('male')
  const currentPersona = PERSONAS[activePersonaKey]

  const [currentLabel, setCurrentLabel] = useState<LeadLabelType>('NEW_LEAD')
  const [showMalayalamTranslation, setShowMalayalamTranslation] = useState(true)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(0)

  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<TrainingMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize persona conversation
  useEffect(() => {
    resetPersonaSession(activePersonaKey)
  }, [activePersonaKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPlayingVoice])

  function resetPersonaSession(personaKey: 'male' | 'female') {
    setIsPlayingVoice(false)
    setVoiceProgress(0)
    setCurrentLabel('NEW_LEAD')

    const p = PERSONAS[personaKey]
    const initialMsgs: TrainingMessage[] = [
      {
        id: `msg-voice-${Date.now()}`,
        sender: 'client',
        body: p.inquiryMalayalam,
        time: 'Just now',
        isVoiceNote: true,
        voiceDuration: p.initialVoiceDuration,
        malayalamTranscript: p.inquiryMalayalam,
        englishTranslation: p.inquiryEnglish,
      },
    ]
    setMessages(initialMsgs)
  }

  // Realistic Malayalam Audio Playback Simulator via Web Speech API or Audio Oscillator
  function toggleVoicePlayback() {
    if (isPlayingVoice) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsPlayingVoice(false)
      setVoiceProgress(0)
    } else {
      setIsPlayingVoice(true)
      setVoiceProgress(5)

      // Animate progress bar over duration
      const interval = setInterval(() => {
        setVoiceProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlayingVoice(false)
            return 0
          }
          return prev + 8
        })
      }, 300)

      // Recite audio preview in Malayalam / English
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(currentPersona.speechText)
        utterance.rate = 0.92
        utterance.pitch = currentPersona.id === 'female' ? 1.2 : 0.9
        utterance.onend = () => {
          setIsPlayingVoice(false)
          clearInterval(interval)
        }
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputMessage).trim()
    if (!text) return

    const agentMsg: TrainingMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      body: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, agentMsg])
    if (!textToSend) setInputMessage('')

    // Simulate Client Response after 1 second
    setTimeout(() => {
      let clientReplyText = ''
      if (text.toLowerCase().includes('price') || text.toLowerCase().includes('₹') || text.toLowerCase().includes('4200')) {
        clientReplyText =
          activePersonaKey === 'male'
            ? 'നന്ദി! ₹4,200 ന് 100ml കുഴപ്പമില്ല. കൊച്ചി മറൈൻ ഡ്രൈവിലെ ഓഫീസിലേക്ക് അയച്ചു തരുമോ? ക്യാഷ് ഓൺ ഡെലിവറി ഉണ്ടോ?'
            : 'Super! 100ml പ്രൈസ് റീസണബിൾ ആണ്. എനിക്ക് ഒരു Discovery sample set കൂടി ചേർത്ത് അയച്ചു തരാമോ? പ്ലീസ് കൺഫേം ചെയ്യൂ.'
      } else if (text.toLowerCase().includes('longevity') || text.toLowerCase().includes('12-hour')) {
        clientReplyText =
          activePersonaKey === 'male'
            ? 'ഗ്രേറ്റ്! 12 മണിക്കൂർ നിൽക്കുമെങ്കിൽ ഞാൻ ഇപ്പോൾ തന്നെ ഓർഡർ ചെയ്യാം.'
            : 'തീർച്ചയായും, ഓഫീസ് വെയറിന് അതാണ് എനിക്ക് വേണ്ടത്. ഓർഡർ എങ്ങനെ പ്ലേസ് ചെയ്യണം?'
      } else {
        clientReplyText =
          activePersonaKey === 'male'
            ? 'ശരി, പെർഫ്യൂമിന്റെ പ്രൊജക്ഷനും നോട്ടുകളും ഇഷ്ടപ്പെട്ടു. അടുത്ത സ്റ്റെപ്പ് എന്താണ്?'
            : 'നന്ദി! നിങ്ങളുടെ റെക്കമെൻഡേഷൻ വളരെ ക്ലിയർ ആണ്. എനിക്ക് ഒരു 100ml ബുക്ക് ചെയ്യണം.'
      }

      const clientReply: TrainingMessage = {
        id: `client-reply-${Date.now()}`,
        sender: 'client',
        body: clientReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        englishTranslation:
          'Client response: "Understood! I would like to proceed with the reservation. Please guide me on next steps."',
      }
      setMessages(prev => [...prev, clientReply])
    }, 1200)
  }

  const activeLabelObj = SYSTEM_LEAD_LABELS[currentLabel]

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* 1. TRAINING MODE DISTINCT HEADER */}
      <div
        className="px-4 py-3 bg-slate-950 border-b border-amber-500/30 flex items-center justify-between flex-shrink-0"
        style={{
          background: 'linear-gradient(90deg, #0A0F1D 0%, #172033 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-serif tracking-wider text-amber-300">
                SALES ADVISOR TRAINING SANDBOX
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-widest">
                TRAINING MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>100% Isolated Sandbox • Zero impact on Super Admin Live Analytics</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => resetPersonaSession(activePersonaKey)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition"
            title="Reset training session"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset Session</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              title="Close Training Hub"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. PERSONA SELECTOR & WORKBENCH RIBBON */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Male vs Female Persona Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActivePersonaKey('male')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activePersonaKey === 'male'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👨</span>
            <span>Male: Rahul Menon (Kochi)</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePersonaKey('female')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activePersonaKey === 'female'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👩</span>
            <span>Female: Anjali Nair (Calicut)</span>
          </button>
        </div>

        {/* Translation Toggle */}
        <button
          type="button"
          onClick={() => setShowMalayalamTranslation(!showMalayalamTranslation)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs text-amber-200 hover:bg-slate-700 transition"
        >
          <Languages size={14} className="text-amber-400" />
          <span>{showMalayalamTranslation ? 'Hide English Translation' : 'Show English Translation'}</span>
        </button>
      </div>

      {/* 3. INTERACTIVE LEAD LABEL PRACTICE BAR */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Tag size={13} className="text-amber-400" />
          <span className="font-semibold text-white">Practice WhatsApp Lead Labels:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SYSTEM_LABEL_KEYS.map(key => {
            const def = SYSTEM_LEAD_LABELS[key]
            const isSelected = currentLabel === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCurrentLabel(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                  isSelected
                    ? 'ring-2 ring-amber-400 scale-105 shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  color: def.color,
                  backgroundColor: def.bg,
                  border: `1px solid ${def.border}`,
                }}
                title={def.description}
              >
                <span>{def.emoji}</span>
                <span>{def.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. CHAT BODY WITH PLAYABLE MALAYALAM VOICE NOTE */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-linear-to-b from-slate-900 to-slate-950">
        {/* Training Context Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5 max-w-2xl mx-auto">
          <Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">
              Scenario: Inbound Kerala Luxury Client Inquiry ({currentPersona.genderLabel})
            </p>
            <p className="mt-0.5 text-slate-300">
              Target Product: <span className="font-semibold text-white">{currentPersona.interestProduct}</span>.
              Listen to the Malayalam audio note below, assign the proper lead label, and practice your high-longevity pitch!
            </p>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'agent' ? 'items-end' : 'items-start'}`}
            >
              {m.isVoiceNote ? (
                /* WhatsApp-Style Playable Voice Note Card */
                <div className="bg-slate-800 border border-amber-400/30 rounded-3xl p-4 shadow-xl max-w-md w-full space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <Volume2 size={14} /> WhatsApp Voice Note (Malayalam)
                    </span>
                    <span className="font-mono text-slate-400">{m.voiceDuration}</span>
                  </div>

                  {/* Audio Player Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleVoicePlayback}
                      className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition flex-shrink-0 cursor-pointer"
                      title={isPlayingVoice ? 'Pause Voice Note' : 'Play Malayalam Voice Note'}
                    >
                      {isPlayingVoice ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>

                    {/* Animated Waveform Visualizer */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1 h-8 px-2 bg-slate-900/60 rounded-xl overflow-hidden">
                        {[40, 70, 90, 60, 30, 80, 100, 65, 45, 95, 80, 50, 75, 90, 60, 40, 85, 95, 70, 40].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              isPlayingVoice ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                            }`}
                            style={{
                              height: `${h}%`,
                              animationDelay: `${i * 50}ms`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{ width: `${voiceProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Malayalam Text Transcript */}
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 space-y-1.5">
                    <p className="text-xs font-medium text-amber-200 leading-relaxed font-sans">
                      {m.malayalamTranscript}
                    </p>
                    {showMalayalamTranslation && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 italic">
                        <span className="text-slate-500 font-bold not-italic mr-1">EN:</span>
                        {m.englishTranslation}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Regular Text Message Bubble */
                <div
                  className={`p-3.5 rounded-2xl max-w-md text-xs sm:text-sm leading-relaxed shadow-md ${
                    m.sender === 'agent'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                      : 'bg-slate-800 text-slate-100 border border-white/10 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  {m.englishTranslation && showMalayalamTranslation && (
                    <p className="mt-1 pt-1 border-t border-white/10 text-[10px] text-slate-400 italic">
                      {m.englishTranslation}
                    </p>
                  )}
                  <span
                    className={`text-[9px] block text-right mt-1 ${
                      m.sender === 'agent' ? 'text-slate-900/70' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 5. SUGGESTED TRAINING PITCH (1-Click Insert) */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-1.5 text-xs text-amber-300">
          <Zap size={14} className="text-amber-400" />
          <span className="font-bold">Recommended 12-Hour Longevity Pitch:</span>
        </div>
        <button
          type="button"
          onClick={() => handleSendMessage(currentPersona.smartPitch)}
          className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          Send Practice Pitch
        </button>
      </div>

      {/* 6. INPUT BAR */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-white/10 max-w-2xl mx-auto w-full flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSendMessage()
          }}
          placeholder={`Reply to ${currentPersona.name} in training mode...`}
          className="flex-1 bg-slate-900 border border-white/15 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim()}
          className="w-11 h-11 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition disabled:opacity-50 font-bold shadow-md cursor-pointer"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
})
