'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Phone, PhoneCall, PhoneOff, MessageCircle, UserPlus, Delete, Globe, ChevronDown, Search, Volume2, Mic, MicOff } from 'lucide-react'
import { COUNTRIES, type Country, parsePhone, formatPhoneDisplay, waLink, telLink } from '@/lib/countries'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSaveAsLead?: (phoneNumber: string) => void
}

interface RecentCall {
  phone: string
  timestamp: string
  duration?: string
}

export function GlobalDialerModal({ isOpen, onClose, onSaveAsLead }: Props) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]) // Default UAE
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [searchCountry, setSearchCountry] = useState('')
  const [activeCall, setActiveCall] = useState<boolean>(false)
  const [callDuration, setCallDuration] = useState<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent calls from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mn_recent_calls')
      if (saved) {
        setRecentCalls(JSON.parse(saved))
      }
    } catch {}
  }, [])

  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(timer)
  }, [activeCall])

  // Click outside country dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  // Auto detect country from typed input if it starts with '+'
  function handleNumberInput(val: string) {
    setPhoneNumber(val)
    if (val.startsWith('+')) {
      const { country } = parsePhone(val)
      if (country) {
        setSelectedCountry(country)
      }
    }
  }

  function handleDialpadPress(digit: string) {
    if (digit === '+' && phoneNumber.length === 0) {
      setPhoneNumber('+')
      return
    }
    setPhoneNumber(prev => prev + digit)
  }

  function handleBackspace() {
    setPhoneNumber(prev => prev.slice(0, -1))
  }

  const fullNumber = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : `${selectedCountry.dial}${phoneNumber.replace(/\D/g, '')}`

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    c.dial.includes(searchCountry) ||
    c.code.toLowerCase().includes(searchCountry.toLowerCase())
  )

  function startCall() {
    if (!fullNumber || fullNumber.length < 5) return
    setActiveCall(true)
    
    // Save to recents
    const newRecent: RecentCall = {
      phone: fullNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [newRecent, ...recentCalls.slice(0, 4)]
    setRecentCalls(updated)
    try {
      localStorage.setItem('mn_recent_calls', JSON.stringify(updated))
    } catch {}

    // Open direct voice call URI
    window.open(telLink(fullNumber), '_self')
  }

  function endCall() {
    setActiveCall(false)
  }

  function startWhatsApp() {
    if (!fullNumber || fullNumber.length < 5) return
    window.open(waLink(fullNumber, 'Hello! This is B Perfume Haute Parfumerie. How can our fragrance advisors assist you today?'), '_blank')
  }

  function formatDuration(sec: number) {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const DIALPAD_BUTTONS = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: '#0F1729' }}>
              <Globe size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Global Dialer</h3>
              <p className="text-[10px] font-medium text-slate-400">Direct International Calling & Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        {/* Active Call Floating Banner */}
        {activeCall ? (
          <div className="p-6 bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
              <PhoneCall size={28} className="text-emerald-400" />
            </div>
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Call in Progress</span>
              <p className="text-xl font-bold font-mono mt-1 text-white">{formatPhoneDisplay(fullNumber)}</p>
              <p className="text-sm text-slate-400 font-mono mt-1">{formatDuration(callDuration)}</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`p-3 rounded-full border transition ${isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button 
                onClick={endCall} 
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition"
                title="End Call"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 flex flex-col space-y-4">
            {/* Country Selector & Number Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Destination Country:</span>
                <span className="font-semibold text-slate-700">{selectedCountry.name}</span>
              </div>

              {/* Input container */}
              <div className="flex items-stretch rounded-2xl border border-slate-200 bg-slate-50/70 p-1 focus-within:ring-2 focus-within:border-transparent transition"
                style={{ '--tw-ring-color': '#C9A84C' } as any}>
                {/* Country dropdown button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 transition h-full text-slate-700"
                  >
                    <span className="text-lg leading-none">{selectedCountry.flag}</span>
                    <span className="text-xs font-mono font-bold text-slate-800">{selectedCountry.dial}</span>
                    <ChevronDown size={11} className="text-slate-400 ml-0.5" />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                      <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            autoFocus
                            value={searchCountry}
                            onChange={e => setSearchCountry(e.target.value)}
                            placeholder="Search country or code..."
                            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {filteredCountries.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c)
                              setCountryDropdownOpen(false)
                              setSearchCountry('')
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-amber-50/40 text-left transition"
                            style={{ background: c.code === selectedCountry.code ? '#FDF6E3' : '' }}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="text-xs text-slate-700 flex-1 truncate">{c.name}</span>
                            <span className="text-xs font-mono text-slate-400">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input box */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => handleNumberInput(e.target.value)}
                  placeholder="50 123 4567"
                  className="flex-1 px-3 py-2 text-base font-mono font-semibold text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
                />

                {phoneNumber.length > 0 && (
                  <button
                    onClick={handleBackspace}
                    className="px-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    <Delete size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Dialpad Grid */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {DIALPAD_BUTTONS.map(btn => (
                <button
                  key={btn.num}
                  onClick={() => handleDialpadPress(btn.num)}
                  className="flex flex-col items-center justify-center py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 active:scale-95 transition border border-slate-100"
                >
                  <span className="text-lg font-bold text-slate-800 leading-none">{btn.num}</span>
                  {btn.letters ? (
                    <span className="text-[8px] font-semibold text-slate-400 tracking-wider mt-0.5">{btn.letters}</span>
                  ) : (
                    <span className="text-[8px] opacity-0 mt-0.5">-</span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons: Voice Call & WhatsApp */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={startCall}
                disabled={!fullNumber || fullNumber.length < 5}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-xs shadow-md transition active:scale-95 disabled:opacity-40"
                style={{ background: '#0F1729' }}
              >
                <Phone size={15} style={{ color: '#C9A84C' }} />
                <span>Direct Voice Call</span>
              </button>

              <button
                onClick={startWhatsApp}
                disabled={!fullNumber || fullNumber.length < 5}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition active:scale-95 disabled:opacity-40"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Message</span>
              </button>
            </div>

            {/* Lead capture shortcut */}
            {onSaveAsLead && (
              <button
                onClick={() => {
                  onSaveAsLead(fullNumber)
                  onClose()
                }}
                disabled={!fullNumber || fullNumber.length < 5}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition disabled:opacity-40"
              >
                <UserPlus size={13} style={{ color: '#C9A84C' }} />
                <span>Save Number as New Lead</span>
              </button>
            )}

            {/* Recent Calls */}
            {recentCalls.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Outbound Dials</p>
                <div className="space-y-1.5">
                  {recentCalls.map((rc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 text-xs">
                      <div className="flex items-center gap-2">
                        <PhoneCall size={11} className="text-slate-400" />
                        <span className="font-mono font-medium text-slate-700">{rc.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{rc.timestamp}</span>
                        <button
                          onClick={() => {
                            setPhoneNumber(rc.phone)
                          }}
                          className="text-[10px] font-semibold text-amber-600 hover:underline"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
