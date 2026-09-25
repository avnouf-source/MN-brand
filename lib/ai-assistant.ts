// B Perfume Luxury Fragrance Consultant AI Persona
import { OFFICIAL_PERFUME_CATALOG, PerfumeProduct, findPerfumeByText, matchPerfumeCriteria } from './products'

export interface LeadContext {
  name: string
  company?: string
  businessRequirement?: string
  leadSource?: string
}

/**
 * Intelligent Fragrance Consultant Auto-Reply Engine
 * Dynamically queries the B Perfume Product Catalog, matches notes & strengths,
 * asks interactive Matchmaker questions, and quotes 50ml & 100ml Indian Rupee prices.
 */
export function generateAIAutoReply(lead: LeadContext, customerMessage?: string): string {
  const firstName = lead.name.split(' ')[0] || 'valued guest'
  const cleanMsg = (customerMessage || '').toLowerCase().trim()

  // 1. Check for specific notes & strength combinations requested by user
  // Example: "Hard perfume with Tobacco notes", "Mild fresh honey", "Woody oud hard"
  const isHard = cleanMsg.includes('hard') || cleanMsg.includes('12-hour') || cleanMsg.includes('12 hour') || cleanMsg.includes('strong') || cleanMsg.includes('intense')
  const isMild = cleanMsg.includes('mild') || cleanMsg.includes('light') || cleanMsg.includes('subtle') || cleanMsg.includes('soft')
  const isModerate = cleanMsg.includes('moderate') || cleanMsg.includes('medium')

  const detectedStrength = isHard ? 'HARD' : isMild ? 'MILD' : isModerate ? 'MODERATE' : undefined

  // Scent notes detection
  const hasTobacco = cleanMsg.includes('tobacco')
  const hasVanilla = cleanMsg.includes('vanilla') || cleanMsg.includes('vanille')
  const hasHoney = cleanMsg.includes('honey') || cleanMsg.includes('dew') || cleanMsg.includes('sweet')
  const hasOud = cleanMsg.includes('oud') || cleanMsg.includes('agarwood')
  const hasWoody = cleanMsg.includes('wood') || cleanMsg.includes('cedar') || cleanMsg.includes('sandal')
  const hasFresh = cleanMsg.includes('fresh') || cleanMsg.includes('citrus') || cleanMsg.includes('lemon') || cleanMsg.includes('mint')
  const hasRose = cleanMsg.includes('rose') || cleanMsg.includes('floral') || cleanMsg.includes('jasmine')
  const hasLeather = cleanMsg.includes('leather') || cleanMsg.includes('smoke') || cleanMsg.includes('smoky')

  // Check if customer mentions a specific product name or code
  const exactPerfume = findPerfumeByText(cleanMsg)

  // CRITICAL SPECIFIC MATCH: Hard + Tobacco or Oud Vanille
  if ((hasTobacco && (isHard || hasVanilla)) || (cleanMsg.includes('oud vanille') || cleanMsg.includes('4415'))) {
    const p = OFFICIAL_PERFUME_CATALOG.find(x => x.productCode === '4415')!
    return (
      `Dear ${firstName}, for your preference in an intense **Hard (12-Hour)** formulation with **rich Tobacco and Vanilla notes**, our master recommendation is:\n\n` +
      `✨ **${p.productName} (Extrait de Parfum)** — Code: #${p.productCode}\n` +
      `⚡ **Strength:** HARD (${p.strength === 'HARD' ? 'Commanding 12-Hour Long-Lasting Projection' : '8-Hour Longevity'})\n` +
      `⚜️ **Inspired by:** ${p.inspiredVersion}\n` +
      `🌿 **Olfactory Pyramid:**\n` +
      `  • Top: ${p.topNotes}\n` +
      `  • Heart: ${p.middleNotes}\n` +
      `  • Base: ${p.baseNotes}\n\n` +
      `💰 **Official Boutique Pricing (₹ INR):**\n` +
      `  • **50ml Flacon:** ₹${p.price50ml.toLocaleString('en-IN')}\n` +
      `  • **100ml Flacon:** ₹${p.price100ml.toLocaleString('en-IN')}\n\n` +
      `Would you like to reserve a 50ml or 100ml bottle today? Your personal sales advisor can dispatch your order with complimentary boutique packaging.`
    )
  }

  // Honey Dew / Sweet / Mild match
  if (hasHoney || cleanMsg.includes('honey dew') || cleanMsg.includes('3301')) {
    const p = OFFICIAL_PERFUME_CATALOG.find(x => x.productCode === '3301')!
    return (
      `Greetings ${firstName}! For a **Mild**, sweet, and comforting aura, our client favorite is:\n\n` +
      `🍯 **${p.productName} (Extrait de Parfum)** — Code: #${p.productCode}\n` +
      `⚡ **Strength:** MILD (Gentle, refined, and non-overpowering)\n` +
      `⚜️ **Inspired by:** ${p.inspiredVersion}\n` +
      `🌿 **Notes:** ${p.topNotes} layered over golden honey, bourbon vanilla, and creamy cedarwood.\n\n` +
      `💰 **Boutique Pricing (₹ INR):**\n` +
      `  • **50ml Flacon:** ₹${p.price50ml.toLocaleString('en-IN')}\n` +
      `  • **100ml Flacon:** ₹${p.price100ml.toLocaleString('en-IN')}\n\n` +
      `Shall we prepare a 50ml travel flacon or full 100ml presentation bottle for you?`
    )
  }

  // Flagship CITYMAN match
  if (cleanMsg.includes('cityman') || cleanMsg.includes('1001') || (cleanMsg.includes('men') && isHard)) {
    const p = OFFICIAL_PERFUME_CATALOG.find(x => x.productCode === '1001')!
    return (
      `Dear ${firstName}, for distinguished gentlemen seeking unmatched prestige, our flagship creation is:\n\n` +
      `👑 **${p.productName}** — Code: #${p.productCode}\n` +
      `⚡ **Strength:** HARD (Guaranteed 12-Hour Long-Lasting Sillage)\n` +
      `🌿 **Notes:** Italian Bergamot, Birch Tar, Smoky Tuscan Leather, and Royal Ambergris.\n\n` +
      `💰 **Pricing:** 50ml at ₹${p.price50ml.toLocaleString('en-IN')} | 100ml at ₹${p.price100ml.toLocaleString('en-IN')}\n\n` +
      `Would you like to reserve the 100ml flacon today with complimentary VIP courier delivery?`
    )
  }

  // Direct match if any other perfume is identified
  if (exactPerfume) {
    return (
      `Dear ${firstName}, here are the official boutique details for **${exactPerfume.productName}**:\n\n` +
      `✨ **Code:** #${exactPerfume.productCode} (${exactPerfume.gender})\n` +
      `⚡ **Strength:** ${exactPerfume.strength} (${exactPerfume.strength === 'HARD' ? '12-Hour Long-Lasting' : '8-Hour Longevity'})\n` +
      `${exactPerfume.inspiredVersion ? `⚜️ **Inspired by:** ${exactPerfume.inspiredVersion}\n` : ''}` +
      `🌿 **Notes:** ${exactPerfume.topNotes} → ${exactPerfume.middleNotes} → ${exactPerfume.baseNotes}\n\n` +
      `💰 **Official Pricing:**\n` +
      `  • **50ml:** ₹${exactPerfume.price50ml.toLocaleString('en-IN')}\n` +
      `  • **100ml:** ₹${exactPerfume.price100ml.toLocaleString('en-IN')}\n\n` +
      `Your personal fragrance stylist is available to assist you with order confirmation right now!`
    )
  }

  // General note preferences match (Matchmaker answering)
  if (hasWoody || hasOud || hasFresh || hasRose || detectedStrength) {
    const matched = matchPerfumeCriteria({
      notePreference: cleanMsg,
      strength: detectedStrength,
    })

    return (
      `Dear ${firstName}, based on your preference for **${detectedStrength || 'luxury'}** formulations and your scent profile, our Sommelier recommends:\n\n` +
      `✨ **${matched.productName} (Extrait de Parfum)** — Code: #${matched.productCode}\n` +
      `⚡ **Strength:** ${matched.strength} (${matched.strength === 'HARD' ? '12-Hour Long-Lasting' : '8-Hour Refined Longevity'})\n` +
      `🌿 **Olfactory Notes:** ${matched.topNotes} → ${matched.middleNotes} → ${matched.baseNotes}\n` +
      `💰 **Pricing:** 50ml: ₹${matched.price50ml.toLocaleString('en-IN')} | 100ml: ₹${matched.price100ml.toLocaleString('en-IN')}\n\n` +
      `Would you like to proceed with this curation, or explore another olfactory category?`
    )
  }

  // 2. Interactive Scent Matchmaker Flow (Default interactive welcome)
  return (
    `Dear ${firstName}, welcome to B Perfume Haute Parfumerie ⚜️\n\n` +
    `I am your dedicated AI Fragrance Consultant. Let us discover your ideal signature flacon in 2 quick steps:\n\n` +
    `1️⃣ **Which olfactory mood speaks to you?**\n` +
    `   • *Deep Woody & Smoky* (Oud, Tobacco Leaf, Smoked Leather)\n` +
    `   • *Sweet & Gourmand* (Wild Honey, Madagascar Vanilla, Cacao)\n` +
    `   • *Crisp & Fresh* (Calabrian Lemon, Sea Breeze, Spearmint)\n` +
    `   • *Royal Floral* (Damask Rose, White Jasmine)\n\n` +
    `2️⃣ **What projection strength do you prefer?**\n` +
    `   • *Hard* (12-Hour commanding room presence)\n` +
    `   • *Moderate* (8-Hour elegant intimacy)\n` +
    `   • *Mild* (Subtle, fresh everyday aura)\n\n` +
    `Kindly reply with your preferred notes & strength (e.g., *"I want a Hard perfume with Tobacco"* or *"Sweet and Mild"*), and I will immediately match your bespoke flacon with pricing!`
  )
}
