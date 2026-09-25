export interface PerfumeProduct {
  id?: string
  productCode: string
  productName: string
  gender: 'UNISEX' | 'MEN' | 'WOMEN'
  price50ml: number
  price100ml: number
  inspiredVersion?: string
  topNotes: string
  middleNotes: string
  baseNotes: string
  strength: 'MILD' | 'MODERATE' | 'HARD'
  inStock?: boolean
  description?: string
}

export const OFFICIAL_PERFUME_CATALOG: PerfumeProduct[] = [
  {
    productCode: '4415',
    productName: 'OUD VANILLE',
    gender: 'UNISEX',
    price50ml: 1150,
    price100ml: 2000,
    strength: 'HARD',
    inspiredVersion: 'TOMFORD TOBACCO VANILLE',
    topNotes: 'Tobacco Leaf, Spicy Notes, Aromatic Ginger',
    middleNotes: 'Tonka Bean, Tobacco Blossom, Rich Vanilla, Roasted Cacao',
    baseNotes: 'Dry Fruit Accord, Precious Woody Notes, Sweet Tree Sap',
    description: 'A decadent, warm oriental extrait with rich smoky tobacco leaf, Madagascar vanilla, and roasted cacao bean. Offers intense 12-hour longevity and commanding sillage.',
  },
  {
    productCode: '3301',
    productName: 'HONEY DEW',
    gender: 'UNISEX',
    price50ml: 950,
    price100ml: 1550,
    strength: 'MILD',
    inspiredVersion: 'KILIAN BACK TO BLACK',
    topNotes: 'Fresh Bergamot, French Chamomile, Honey Dew Melon Accord',
    middleNotes: 'Atlas Cedarwood, Patchouli, Almond Blossom, Nutmeg',
    baseNotes: 'Golden Amber, Bourbon Vanilla Orchid, Tonka Bean, Soft Musk',
    description: 'An ethereal and gentle gourmand elixir balancing sweet wild honey and sun-ripened melon with velvety vanilla and powdery almond.',
  },
  {
    productCode: '1001',
    productName: 'CITYMAN EXTRAIT',
    gender: 'MEN',
    price50ml: 1250,
    price100ml: 2200,
    strength: 'HARD',
    inspiredVersion: 'CREED AVENTUS / ROJA HYBRID (FLAGSHIP)',
    topNotes: 'Italian Bergamot, Pink Peppercorn, Juicy Blackcurrant, Pineapple',
    middleNotes: 'French Birch Tar, Smoky Patchouli, Moroccan Jasmine',
    baseNotes: 'Smoked Tuscan Leather, Royal Grey Ambergris, Oakmoss, Musk',
    description: 'Our flagship signature masculine creation. Fresh zesty bergamot layered over rich smoky birch tar and opulent ambergris for unmatched executive presence.',
  },
  {
    productCode: '2104',
    productName: 'VELVET ROSE',
    gender: 'WOMEN',
    price50ml: 1050,
    price100ml: 1850,
    strength: 'MODERATE',
    inspiredVersion: 'MFK OUD SATIN MOOD',
    topNotes: 'Damask Rose Water, Turkish Rose Petals, Sparkling Lychee',
    middleNotes: 'Bulgarian Rose, Candied Violet, Siamese Benzoin',
    baseNotes: 'Assam Agarwood Oud, Golden Amber, Creamy Madagascar Vanilla',
    description: 'A sumptuous satin-smooth floral drape weaving precious dual roses with creamy amber resin and gentle oud wood for radiant elegance.',
  },
  {
    productCode: '5502',
    productName: 'OUD ROYALE',
    gender: 'UNISEX',
    price50ml: 1350,
    price100ml: 2400,
    strength: 'HARD',
    inspiredVersion: 'LOUIS VUITTON OMBRE NOMADE',
    topNotes: 'Wild Raspberry, Iranian Saffron, Incense Smoke',
    middleNotes: 'Taif Rose Petals, Birchwood, Egyptian Geranium',
    baseNotes: 'Pure Assam Agarwood Oud, Benzoin Tears, Dark Amberwood',
    description: 'A powerhouse oriental masterpiece featuring smoky incense, saffron threads, and vintage Assam oud kissed by wild raspberry.',
  },
  {
    productCode: '6608',
    productName: 'SANTAL IMPERIAL',
    gender: 'UNISEX',
    price50ml: 1100,
    price100ml: 1950,
    strength: 'MODERATE',
    inspiredVersion: 'LE LABO SANTAL 33',
    topNotes: 'Crushed Cardamom, Violet Leaf, Italian Iris',
    middleNotes: 'Australian Mysore Sandalwood, Papyrus, Virginia Cedar',
    baseNotes: 'Weathered Leather, Golden Amber, Iso-E-Super, Soft Cashmere Musk',
    description: 'An iconic dry, woody, and leathery aura driven by creamy Australian sandalwood, crisp papyrus, and subtle cardamom spice.',
  },
  {
    productCode: '7712',
    productName: 'CITRUS RIVIERA',
    gender: 'UNISEX',
    price50ml: 900,
    price100ml: 1500,
    strength: 'MILD',
    inspiredVersion: 'TOM FORD MANDARINO DI AMALFI',
    topNotes: 'Calabrian Lemon, Bitter Orange, Wild Spearmint, Basil Leaf',
    middleNotes: 'Tunisian Orange Blossom, Jasmine Sambac, Coriander Seed',
    baseNotes: 'Haitian Vetiver, White Ambergris, Clean Laundry Musk',
    description: 'A breath of fresh sea breeze overlooking Mediterranean cliffs. Sparkling citrus, crisp green mint, and luminous white florals for effortless daytime charm.',
  },
  {
    productCode: '8820',
    productName: 'AMBER BLANC',
    gender: 'WOMEN',
    price50ml: 1150,
    price100ml: 2050,
    strength: 'MODERATE',
    inspiredVersion: 'BACCARAT ROUGE 540 EXTRAIT',
    topNotes: 'Bitter Almond of Morocco, Saffron Threads',
    middleNotes: 'Egyptian Grandiflorum Jasmine, Virginian Cedarwood',
    baseNotes: 'Crystalline Ambergris, Woody Musk, Fir Balsam Resin',
    description: 'An intoxicating mineral and gourmand halo with spun sugar saffron, bitter almond, and ambergris that radiates endlessly on skin.',
  },
]

/**
 * Searches the catalog for perfumes matching keyword, strength, gender, or note
 */
export function findPerfumeByText(query: string): PerfumeProduct | undefined {
  const q = query.toLowerCase().trim()
  if (!q) return undefined

  // 1. Direct code or name match
  const directMatch = OFFICIAL_PERFUME_CATALOG.find(
    p =>
      p.productCode.toLowerCase() === q ||
      p.productName.toLowerCase().includes(q) ||
      q.includes(p.productName.toLowerCase()) ||
      (p.inspiredVersion && p.inspiredVersion.toLowerCase().includes(q))
  )
  if (directMatch) return directMatch

  // 2. Keyword note match (e.g. tobacco, honey, oud, vanilla, rose, leather, sandal, citrus)
  return OFFICIAL_PERFUME_CATALOG.find(p => {
    const combinedNotes = `${p.topNotes} ${p.middleNotes} ${p.baseNotes} ${p.description || ''}`.toLowerCase()
    return combinedNotes.includes(q)
  })
}

/**
 * Multi-criteria scent matchmaker algorithm
 */
export function matchPerfumeCriteria(criteria: {
  notePreference?: string // 'woody' | 'sweet' | 'fresh' | 'floral' | 'oud' | 'tobacco' | etc.
  strength?: 'MILD' | 'MODERATE' | 'HARD'
  gender?: 'MEN' | 'WOMEN' | 'UNISEX'
}): PerfumeProduct {
  const { notePreference = '', strength, gender } = criteria
  const lowerNote = notePreference.toLowerCase()

  // Filter candidates
  const candidates = OFFICIAL_PERFUME_CATALOG.filter(p => {
    let score = 0
    const textCorpus = `${p.productName} ${p.topNotes} ${p.middleNotes} ${p.baseNotes} ${p.description || ''} ${p.inspiredVersion || ''}`.toLowerCase()

    if (strength && p.strength === strength) score += 3
    if (gender && (p.gender === gender || p.gender === 'UNISEX')) score += 2

    if (lowerNote) {
      if (lowerNote.includes('tobacco') && textCorpus.includes('tobacco')) score += 5
      if (lowerNote.includes('vanil') && textCorpus.includes('vanil')) score += 4
      if (lowerNote.includes('sweet') && (textCorpus.includes('honey') || textCorpus.includes('vanil') || textCorpus.includes('sweet'))) score += 4
      if (lowerNote.includes('honey') && textCorpus.includes('honey')) score += 5
      if (lowerNote.includes('oud') && textCorpus.includes('oud')) score += 5
      if (lowerNote.includes('wood') && (textCorpus.includes('wood') || textCorpus.includes('cedar') || textCorpus.includes('sandal'))) score += 4
      if (lowerNote.includes('fresh') && (textCorpus.includes('citrus') || textCorpus.includes('mint') || textCorpus.includes('bergamot'))) score += 5
      if (lowerNote.includes('floral') || lowerNote.includes('rose')) {
        if (textCorpus.includes('rose') || textCorpus.includes('jasmine')) score += 5
      }
    }

    return (p as any)._score = score
  })

  // Sort by highest score
  candidates.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0))
  return candidates[0] || OFFICIAL_PERFUME_CATALOG[0] // Default to OUD VANILLE or CITYMAN
}
