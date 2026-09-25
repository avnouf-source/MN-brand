'use client'
import { Phone, MessageCircle, Copy, Globe } from 'lucide-react'
import { formatPhoneDisplay, waLink, telLink, parsePhone } from '@/lib/countries'

interface Props { phone: string; name?: string }

export function PhoneActionBar({ phone, name }: Props) {
  const { country } = parsePhone(phone)
  const display = formatPhoneDisplay(phone)
  const greeting = name ? `Dear ${name.split(' ')[0]}, greetings from B Perfume Haute Parfumerie ⚜️ ` : 'Greetings from B Perfume Haute Parfumerie ⚜️ '

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {country && <span className="text-xl leading-none flex-shrink-0">{country.flag}</span>}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 font-mono tracking-wide">{display}</p>
            {country && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Globe size={10} />{country.name}</p>}
          </div>
          <button onClick={() => navigator.clipboard.writeText(phone)} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600" title="Copy number">
            <Copy size={13} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100">
        <a href={waLink(phone, greeting)} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition">
          <MessageCircle size={14} /> WhatsApp
        </a>
        <a href={telLink(phone)} className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition">
          <Phone size={14} /> Call
        </a>
      </div>
    </div>
  )
}
