'use client'
import { Sparkles, Flame, Droplets, Wind, X, Send, Receipt, ExternalLink } from 'lucide-react'
import { PerfumeProduct } from '@/lib/products'

interface Props {
  product: PerfumeProduct
  onClose: () => void
  onInsertPitch: (text: string) => void
  onOpenInvoice: (product: PerfumeProduct) => void
}

export function PerfumeCheatSheetCard({
  product,
  onClose,
  onInsertPitch,
  onOpenInvoice,
}: Props) {
  const isHard = product.strength === 'HARD'
  const isModerate = product.strength === 'MODERATE'

  function handleInsert() {
    const text = `✨ *${product.productName} (Extrait de Parfum)* — #${product.productCode} (${product.strength} Strength, 12h Long-Lasting). Notes: ${product.topNotes} → ${product.middleNotes} → ${product.baseNotes}. Available in 50ml (₹${product.price50ml.toLocaleString('en-IN')}) and 100ml (₹${product.price100ml.toLocaleString('en-IN')}).`
    onInsertPitch(text)
  }

  return (
    <div className="rounded-2xl border shadow-lg bg-white p-4 animate-in slide-in-from-top-2 duration-200 border-amber-300/80 bg-gradient-to-b from-[#FFFDF9] to-white relative overflow-hidden">
      {/* Decorative subtle gold header stripe */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#C9A84C' }} />

      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-900 text-white">
            <Sparkles size={11} style={{ color: '#C9A84C' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                Cheat Sheet
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-500">#{product.productCode}</span>
            </div>
            <h4
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-sm font-bold text-slate-900 mt-0.5"
            >
              {product.productName}
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          title="Dismiss cheat sheet"
        >
          <X size={14} />
        </button>
      </div>

      {/* Inspired & Strength Row */}
      <div className="flex items-center justify-between text-[11px] my-2 pb-2 border-b border-slate-100">
        <span className="text-slate-500 italic truncate max-w-[190px]">
          {product.inspiredVersion ? `Inspired by ${product.inspiredVersion}` : `${product.gender} Collection`}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isHard
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : isModerate
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isHard ? <Flame size={9} /> : isModerate ? <Wind size={9} /> : <Droplets size={9} />}
          {product.strength}
        </span>
      </div>

      {/* Notes Breakdown */}
      <div className="space-y-1 text-[11px] my-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
        <div>
          <span className="font-semibold text-slate-700">Top: </span>
          <span className="text-slate-600">{product.topNotes}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-700">Heart: </span>
          <span className="text-slate-600">{product.middleNotes}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-700">Base: </span>
          <span className="text-slate-600">{product.baseNotes}</span>
        </div>
      </div>

      {/* Dual Price Bar */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 border border-amber-100 text-xs mb-3">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">50ml Flacon</span>
          <span className="font-bold text-slate-900">₹{product.price50ml.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase block">100ml Flacon</span>
          <span className="font-bold text-amber-800 font-serif">₹{product.price100ml.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleInsert}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          title="Insert pitch directly into chat input"
        >
          <Send size={11} className="text-amber-700" />
          <span>Insert Pitch</span>
        </button>
        <button
          onClick={() => onOpenInvoice(product)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold text-white shadow-2xs transition active:scale-95 cursor-pointer"
          style={{ background: '#0A0F1D' }}
          title="Generate WhatsApp invoice"
        >
          <Receipt size={11} style={{ color: '#C9A84C' }} />
          <span>Send Invoice</span>
        </button>
      </div>
    </div>
  )
}
