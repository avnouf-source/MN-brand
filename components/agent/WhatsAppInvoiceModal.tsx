'use client'
import { useState } from 'react'
import { X, Receipt, Check, Sparkles, Send, Copy, ShieldCheck, Flame, Droplets, Wind } from 'lucide-react'
import { OFFICIAL_PERFUME_CATALOG, PerfumeProduct } from '@/lib/products'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSendInvoice: (invoiceText: string) => void
  clientName: string
  clientPhone: string
  preselectedProduct?: PerfumeProduct | null
}

export function WhatsAppInvoiceModal({
  isOpen,
  onClose,
  onSendInvoice,
  clientName,
  clientPhone,
  preselectedProduct,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<PerfumeProduct>(
    preselectedProduct || OFFICIAL_PERFUME_CATALOG[0]
  )
  const [bottleSize, setBottleSize] = useState<'50ml' | '100ml'>('100ml')
  const [quantity, setQuantity] = useState(1)
  const [customDiscount, setCustomDiscount] = useState(0)
  const [includeComplimentarySample, setIncludeComplimentarySample] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  if (!isOpen) return null

  const unitPrice = bottleSize === '100ml' ? selectedProduct.price100ml : selectedProduct.price50ml
  const subtotal = unitPrice * quantity
  const finalPrice = Math.max(0, subtotal - customDiscount)
  const invoiceNumber = `BP-INV-${Math.floor(100000 + Math.random() * 900000)}`

  function buildInvoiceText(): string {
    return (
      `⚜️ *B PERFUME — OFFICIAL ORDER INVOICE* ⚜️\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📄 *Invoice #:* \`${invoiceNumber}\`\n` +
      `👤 *Client:* ${clientName || 'VIP Client'}\n` +
      `📞 *Phone:* ${clientPhone}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-GB')}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✨ *Item:* ${selectedProduct.productName} (Extrait de Parfum)\n` +
      `🏷️ *Product Code:* #${selectedProduct.productCode}\n` +
      `🧴 *Size:* ${bottleSize} Presentation Flacon\n` +
      `⚡ *Strength:* ${selectedProduct.strength} (12-Hour Long-Lasting)\n` +
      `🌿 *Notes:* ${selectedProduct.topNotes} → ${selectedProduct.middleNotes} → ${selectedProduct.baseNotes}\n` +
      `📦 *Qty:* ${quantity}\n` +
      `${customDiscount > 0 ? `🏷️ *VIP Privilège Savings:* -₹${customDiscount.toLocaleString('en-IN')}\n` : ''}` +
      `${includeComplimentarySample ? `🎁 *Gift:* Complimentary 5ml Discovery Flacon\n` : ''}` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *TOTAL PAYABLE:* *₹${finalPrice.toLocaleString('en-IN')}* (All Taxes & Boutique Delivery Included)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🚚 *Dispatch Status:* Hand-packaged at Atelier Paris & Mumbai within 24 hours.\n` +
      `🔗 *Secure Confirmation & Payment Portal:*\n` +
      `https://bperfume.com/pay/${invoiceNumber}\n\n` +
      `_Thank you for choosing B Perfume Haute Parfumerie._`
    )
  }

  async function handleSend() {
    const text = buildInvoiceText()

    // Also schedule 60-day refill reminder automatically in the background
    try {
      fetch('/api/automation/refills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: clientName,
          customerPhone: clientPhone,
          productName: selectedProduct.productName,
          productCode: selectedProduct.productCode,
          bottleSize,
        }),
      })
    } catch {}

    onSendInvoice(text)
    onClose()
  }

  function handleCopy() {
    const text = buildInvoiceText()
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4.5 flex items-center justify-between text-white" style={{ background: '#0A0F1D' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Receipt size={16} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-base font-bold tracking-wide">
                One-Click WhatsApp Invoice
              </h3>
              <p className="text-[10px] text-amber-300/80 font-mono tracking-wider">
                {invoiceNumber} · {clientName || 'VIP Client'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Select Product */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Perfume Formulation
            </label>
            <select
              value={selectedProduct.productCode}
              onChange={e => {
                const p = OFFICIAL_PERFUME_CATALOG.find(x => x.productCode === e.target.value)
                if (p) setSelectedProduct(p)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {OFFICIAL_PERFUME_CATALOG.map(p => (
                <option key={p.productCode} value={p.productCode}>
                  #{p.productCode} — {p.productName} ({p.gender}) · {p.strength} · ₹{p.price100ml.toLocaleString('en-IN')} (100ml)
                </option>
              ))}
            </select>
          </div>

          {/* Size & Quantity Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Bottle Size</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBottleSize('50ml')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    bottleSize === '50ml' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  50ml (₹{selectedProduct.price50ml.toLocaleString('en-IN')})
                </button>
                <button
                  type="button"
                  onClick={() => setBottleSize('100ml')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    bottleSize === '100ml' ? 'bg-white shadow-2xs text-amber-700' : 'text-slate-500'
                  }`}
                >
                  100ml (₹{selectedProduct.price100ml.toLocaleString('en-IN')})
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-sm text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* VIP Discount & Free Sample */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">VIP Discount (₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={customDiscount}
                onChange={e => setCustomDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeComplimentarySample}
                  onChange={e => setIncludeComplimentarySample(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>Include 5ml Gift Sample</span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl border border-amber-200/70 bg-[#FFFDF9] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Formulation Selected:</span>
              <span className="font-bold text-slate-900">{selectedProduct.productName} ({bottleSize})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Longevity Guarantee:</span>
              <span className="font-semibold text-amber-800">12-Hour Long-Lasting Extrait</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">60-Day Smart Refill:</span>
              <span className="font-semibold text-emerald-700">Auto-Scheduled on Send</span>
            </div>
            <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">Grand Total (₹ INR)</span>
              <span className="text-xl font-bold font-serif text-slate-900" style={{ color: '#0A0F1D' }}>
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-xs transition active:scale-95 cursor-pointer"
            style={{ background: '#0A0F1D' }}
          >
            <Send size={13} style={{ color: '#C9A84C' }} />
            <span>Send Invoice to WhatsApp (₹{finalPrice.toLocaleString('en-IN')})</span>
          </button>
        </div>
      </div>
    </div>
  )
}
