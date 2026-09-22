'use client'
import { useState, useRef } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, type Country } from '@/lib/countries'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInput({ value, onChange, placeholder = '50 123 4567', className = '' }: Props) {
  const detect = (): Country => {
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
    for (const c of sorted) { if (value.startsWith(c.dial)) return c }
    return COUNTRIES[0]
  }
  const [country, setCountry] = useState<Country>(detect)
  const [local, setLocal] = useState(() => { const c = detect(); return value.startsWith(c.dial) ? value.slice(c.dial.length) : value })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  function pickCountry(c: Country) { setCountry(c); setOpen(false); setSearch(''); onChange(c.dial + local.replace(/\D/g, '')) }
  function onLocal(v: string) { const d = v.replace(/[^\d\s\-()]/g, ''); setLocal(d); onChange(country.dial + d.replace(/\D/g, '')) }
  const list = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search) || c.code.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={`relative flex items-stretch rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:border-transparent transition ${className}`}
      style={{ '--tw-ring-color': '#C9A84C' } as any}>
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-200 rounded-l-xl bg-white hover:bg-slate-50 transition h-full">
          <span className="text-lg leading-none">{country.flag}</span>
          <span className="text-xs font-mono font-medium text-slate-600">{country.dial}</span>
          <ChevronDown size={12} className="text-slate-400" />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search country..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1" />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {list.map(c => (
                <button key={c.code} type="button" onClick={() => pickCountry(c)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition"
                  style={{ background: c.code === country.code ? '#FDF6E3' : '' }}>
                  <span className="text-base leading-none w-6">{c.flag}</span>
                  <span className="text-xs text-slate-700 flex-1">{c.name}</span>
                  <span className="text-xs font-mono text-slate-400">{c.dial}</span>
                </button>
              ))}
              {list.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No results</p>}
            </div>
          </div>
        )}
      </div>
      <input type="tel" value={local} onChange={e => onLocal(e.target.value)} placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none rounded-r-xl placeholder-slate-400" />
    </div>
  )
}
