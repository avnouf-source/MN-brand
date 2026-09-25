'use client'
import { Sparkles, Zap, X, Send, ArrowUpRight } from 'lucide-react'

export interface LuxuryTemplate {
  id: string
  title: string
  category: string
  body: string
  badge: string
}

export const LUXURY_TEMPLATES: LuxuryTemplate[] = [
  {
    id: 'lt-welcome',
    title: '🌸 Welcome & Scent Consultation',
    category: 'Greeting',
    badge: 'VIP Welcome',
    body: "Welcome to B Perfume Haute Parfumerie ⚜️ Would you prefer exploring our Men's Collection (featuring flagship CITYMAN Extrait), Women's (Velvet Rose), or Unisex (Oud Royale)?",
  },
  {
    id: 'lt-cityman',
    title: '🎩 CITYMAN Extrait (12-Hour Flagship)',
    category: 'Product Recommendation',
    badge: 'Top Seller',
    body: "CITYMAN Extrait de Parfum is our signature formulation: Italian bergamot, smoked cedarwood, and white musk with an ultra-potent 12-hour sillage. Shall we reserve a 100ml flacon (₹2,200) for you?",
  },
  {
    id: 'lt-velvet-rose',
    title: '🌹 Velvet Rose Pour Femme',
    category: 'Product Recommendation',
    badge: "Women's Extrait",
    body: "Velvet Rose Pour Femme is crafted with Grasse damascena rose, candied amber, and soft musk. Formulated at pure Extrait concentration to last well over 12 hours.",
  },
  {
    id: 'lt-order-confirmed',
    title: '📦 Order Confirmation & Metro Dispatch',
    category: 'Fulfillment',
    badge: 'Express VIP',
    body: "Your B Perfume flacon order is confirmed! Dispatched via express courier with insured luxury packaging across Mumbai, Delhi, Bengaluru, and all metro cities within 24-48 hours.",
  },
  {
    id: 'lt-extrait-info',
    title: '✨ 12-Hour Extrait Formulation Difference',
    category: 'Product Education',
    badge: '30%+ Pure Oil',
    body: "All B Perfume creations are formulated strictly as pure Extrait de Parfum (30%+ perfume oil concentration), guaranteeing a persistent 12-hour sillage and exceptional projection compared to standard Eau de Parfum.",
  },
  {
    id: 'lt-oud-royale',
    title: '🪵 Assam Oud Royale Extrait',
    category: 'Product Recommendation',
    badge: 'Imperial Agarwood',
    body: "Oud Royale Extrait features imperial aged Assam agarwood, Taif rose, and smoky incense with unmatched depth and majesty. Formulated at pure Extrait concentration.",
  },
  {
    id: 'lt-payment',
    title: '💳 Secure Payment & Invoice Link',
    category: 'Billing',
    badge: '1-Click Pay',
    body: "Here is your official B Perfume invoice and secure payment link for express delivery: https://bperfume.com/pay. All major UPI, Credit Cards, and Net Banking supported.",
  },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (body: string, sendImmediately?: boolean) => void
}

export function QuickLuxuryRepliesMenu({ isOpen, onClose, onSelect }: Props) {
  if (!isOpen) return null

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="mx-2 sm:mx-4 bg-white rounded-2xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[380px]">
        {/* Header */}
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white flex-shrink-0"
          style={{ background: '#0A0F1D' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.2)' }}
            >
              <Zap size={14} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <p className="text-xs font-bold font-serif text-white tracking-wide">
                Quick Luxury Replies
              </p>
              <p className="text-[10px] text-amber-200/70">
                1-tap client responses &amp; bespoke fragrance pitches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
          {LUXURY_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              className="p-2.5 rounded-xl hover:bg-amber-50/50 transition group flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                  {tmpl.title}
                </span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {tmpl.badge}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {tmpl.body}
              </p>

              {/* Action Buttons: Insert or Send Immediately */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(tmpl.body, false)
                    onClose()
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Insert in input
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelect(tmpl.body, true)
                    onClose()
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold text-white transition shadow-2xs active:scale-95"
                  style={{ background: '#0F1729' }}
                >
                  <Send size={10} style={{ color: '#C9A84C' }} />
                  <span>Send Instantly</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
