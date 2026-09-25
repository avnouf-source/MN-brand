'use client'
import { useState } from 'react'
import {
  Search,
  Filter,
  Sparkles,
  Plus,
  Tag,
  Flame,
  Droplets,
  Wind,
  Check,
  Copy,
  Receipt,
  Layers,
  ArrowUpDown,
  ShieldCheck,
  X,
} from 'lucide-react'
import { PerfumeProduct, OFFICIAL_PERFUME_CATALOG } from '@/lib/products'

interface Props {
  initialProducts?: PerfumeProduct[]
}

export function ProductCatalogView({ initialProducts = OFFICIAL_PERFUME_CATALOG }: Props) {
  const [products, setProducts] = useState<PerfumeProduct[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [strengthFilter, setStrengthFilter] = useState<'ALL' | 'HARD' | 'MODERATE' | 'MILD'>('ALL')
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'UNISEX' | 'MEN' | 'WOMEN'>('ALL')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<Partial<PerfumeProduct>>({
    productCode: '',
    productName: '',
    gender: 'UNISEX',
    price50ml: 1100,
    price100ml: 1950,
    strength: 'MODERATE',
    inspiredVersion: '',
    topNotes: '',
    middleNotes: '',
    baseNotes: '',
  })

  const filtered = products.filter(p => {
    const matchesSearch =
      !search ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.includes(search) ||
      (p.inspiredVersion && p.inspiredVersion.toLowerCase().includes(search.toLowerCase())) ||
      p.topNotes.toLowerCase().includes(search.toLowerCase()) ||
      p.middleNotes.toLowerCase().includes(search.toLowerCase()) ||
      p.baseNotes.toLowerCase().includes(search.toLowerCase())

    const matchesStrength = strengthFilter === 'ALL' || p.strength === strengthFilter
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter

    return matchesSearch && matchesStrength && matchesGender
  })

  function copyPitch(p: PerfumeProduct) {
    const pitch = `✨ *${p.productName} (Extrait de Parfum)* — Code: ${p.productCode}\n⚡ Strength: ${p.strength} (12-Hour Long-Lasting)\n🧴 50ml: ₹${p.price50ml.toLocaleString('en-IN')} | 100ml: ₹${p.price100ml.toLocaleString('en-IN')}\n🌿 Notes: ${p.topNotes} → ${p.middleNotes} → ${p.baseNotes}\n👑 Handcrafted by B Perfume Haute Parfumerie`
    navigator.clipboard.writeText(pitch)
    setCopiedCode(p.productCode)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productCode || !form.productName || !form.price50ml || !form.price100ml) return

    const newProd = form as PerfumeProduct
    setProducts(prev => [newProd, ...prev])
    setShowAddModal(false)

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch (err) {
      console.warn('Saved locally in catalog state:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-2xl font-bold text-slate-900 tracking-wide"
            >
              B Perfume Catalog &amp; Formulations
            </h1>
            <span
              style={{ background: '#FDF6E3', color: '#8B7A3D', border: '1px solid #E8D5A0' }}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            >
              Official Vault
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master olfactory profiles, 12-hour Extrait strengths, and dual-flacon pricing (50ml &amp; 100ml)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition active:scale-95 cursor-pointer"
            style={{ background: '#0A0F1D' }}
          >
            <Plus size={13} style={{ color: '#C9A84C' }} />
            <span>Add Flacon</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Formulations</p>
          <p className="text-xl font-bold font-serif text-slate-900 mt-0.5">{products.length} Flacons</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">100% In Boutique Stock</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hard Strength (12h+)</p>
          <p className="text-xl font-bold font-serif text-slate-900 mt-0.5">
            {products.filter(p => p.strength === 'HARD').length} Scents
          </p>
          <p className="text-[10px] text-amber-700 mt-0.5">Flagship OUD VANILLE &amp; CITYMAN</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Flacon Sizes</p>
          <p className="text-xl font-bold font-serif text-slate-900 mt-0.5">50ml &amp; 100ml</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Dual Luxury Tier</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Price Range (₹ INR)</p>
          <p className="text-xl font-bold font-serif text-slate-900 mt-0.5">₹900 – ₹2,400</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Luxury Artisanal Accessible</p>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by code (4415), name (OUD VANILLE), notes (Tobacco, Vanilla)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Strength Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={11} /> Strength:
            </span>
            {(['ALL', 'HARD', 'MODERATE', 'MILD'] as const).map(s => {
              const active = strengthFilter === s
              return (
                <button
                  key={s}
                  onClick={() => setStrengthFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {s === 'HARD' ? '🔥 Hard (12h)' : s === 'MODERATE' ? '✨ Moderate' : s === 'MILD' ? '🌿 Mild' : 'All'}
                </button>
              )
            })}
          </div>

          {/* Gender Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Gender:</span>
            {(['ALL', 'UNISEX', 'MEN', 'WOMEN'] as const).map(g => {
              const active = genderFilter === g
              return (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const isHard = p.strength === 'HARD'
          const isModerate = p.strength === 'MODERATE'
          const isCopied = copiedCode === p.productCode

          return (
            <div
              key={p.productCode}
              className="rounded-2xl border bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              style={{
                borderColor: isHard ? 'rgba(201,168,76,0.35)' : '#E2E8F0',
                background: isHard ? 'linear-gradient(180deg, #FFFFFF 0%, #FDFCF9 100%)' : '#FFFFFF',
              }}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      #{p.productCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {p.gender}
                    </span>
                  </div>

                  {/* Strength Pill */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isHard
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isModerate
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isHard ? <Flame size={10} /> : isModerate ? <Wind size={10} /> : <Droplets size={10} />}
                    {p.strength}
                  </span>
                </div>

                {/* Perfume Name */}
                <h3
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-lg font-bold text-slate-900 tracking-tight"
                >
                  {p.productName}
                </h3>

                {/* Inspired Reference */}
                {p.inspiredVersion && (
                  <p className="text-[11px] font-medium text-amber-700/90 mt-0.5 italic">
                    Inspired by: {p.inspiredVersion}
                  </p>
                )}

                {/* Dual Pricing Box */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-center border-r border-slate-200/80 pr-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">50ml Flacon</span>
                    <span className="text-base font-bold font-serif text-slate-900">
                      ₹{p.price50ml.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-center pl-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">100ml Flacon</span>
                    <span className="text-base font-bold font-serif text-amber-700">
                      ₹{p.price100ml.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Olfactory Notes Breakdown */}
                <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="font-semibold text-slate-700">Top: </span>
                    <span className="text-slate-500">{p.topNotes}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Heart: </span>
                    <span className="text-slate-500">{p.middleNotes}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Base: </span>
                    <span className="text-slate-500">{p.baseNotes}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => copyPitch(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  title="Copy full perfume recommendation text for WhatsApp"
                >
                  {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied Pitch!' : 'WhatsApp Pitch'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <p className="text-base font-semibold text-slate-700 font-serif">No Fragrances Found</p>
          <p className="text-xs text-slate-400">Try adjusting your search terms or resetting filters.</p>
        </div>
      )}

      {/* Add Flacon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: '#0A0F1D' }}>
              <div>
                <h3 className="text-sm font-bold text-white font-serif tracking-wide">Add New Formulation</h3>
                <p className="text-[10px] text-amber-300/80">Register a new artisanal flacon to the vault</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Product Code *</label>
                  <input
                    required
                    value={form.productCode}
                    onChange={e => setForm({ ...form, productCode: e.target.value })}
                    placeholder="e.g. 9901"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    required
                    value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })}
                    placeholder="e.g. OUD SUPREME"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="UNISEX">UNISEX</option>
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Strength *</label>
                  <select
                    value={form.strength}
                    onChange={e => setForm({ ...form, strength: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="HARD">HARD (12-Hour Projection)</option>
                    <option value="MODERATE">MODERATE (8-Hour)</option>
                    <option value="MILD">MILD (Fresh &amp; Subtle)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price 50ml (₹) *</label>
                  <input
                    required
                    type="number"
                    value={form.price50ml}
                    onChange={e => setForm({ ...form, price50ml: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price 100ml (₹) *</label>
                  <input
                    required
                    type="number"
                    value={form.price100ml}
                    onChange={e => setForm({ ...form, price100ml: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Inspired By Version</label>
                <input
                  value={form.inspiredVersion}
                  onChange={e => setForm({ ...form, inspiredVersion: e.target.value })}
                  placeholder="e.g. TOMFORD TOBACCO VANILLE"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Top Notes</label>
                <input
                  value={form.topNotes}
                  onChange={e => setForm({ ...form, topNotes: e.target.value })}
                  placeholder="e.g. Bergamot, Pink Pepper"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Middle / Heart Notes</label>
                <input
                  value={form.middleNotes}
                  onChange={e => setForm({ ...form, middleNotes: e.target.value })}
                  placeholder="e.g. French Lavender, Smoky Patchouli"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Base Notes</label>
                <input
                  value={form.baseNotes}
                  onChange={e => setForm({ ...form, baseNotes: e.target.value })}
                  placeholder="e.g. Smoked Leather, Ambergris"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs cursor-pointer"
                  style={{ background: '#0A0F1D' }}
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
