// B Perfume Luxury Fragrance Consultant AI Persona

export interface LeadContext {
  name: string
  company?: string
  businessRequirement?: string
  leadSource?: string
}

export function generateAIAutoReply(lead: LeadContext, customerMessage?: string): string {
  const firstName = lead.name.split(' ')[0] || 'valued guest'
  const cleanMsg = (customerMessage || '').toLowerCase()

  // 1. Inquiry specifically about Men, Women, or Unisex
  if (cleanMsg.includes('men') || cleanMsg.includes('him') || cleanMsg.includes('man') || cleanMsg.includes('cityman')) {
    return (
      `Dear ${firstName}, welcome to B Perfume Haute Parfumerie ⚜️\n\n` +
      `For distinguished gentlemen, our crowning creation is the **CITYMAN Extrait de Parfum** — renowned for its rich bergamot, smoked cedarwood, and signature **12-hour long-lasting sillage**.\n\n` +
      `Would you like to reserve a 100ml flacon today with complimentary VIP courier delivery, or shall our scent stylist guide you through our complete Men's Collection?`
    )
  }

  if (cleanMsg.includes('women') || cleanMsg.includes('her') || cleanMsg.includes('floral') || cleanMsg.includes('rose')) {
    return (
      `Greetings ${firstName}, welcome to B Perfume Haute Parfumerie 🌹\n\n` +
      `Our Women's Haute Collection is led by **Velvet Rose Pour Femme Extrait** — infused with Grasse damascena rose, white musk, and a radiant **12-hour long-lasting finish**.\n\n` +
      `May we prepare a bespoke scent presentation for you, or do you have a specific olfactory profile in mind (floral, sweet amber, or aquatic)?`
    )
  }

  if (cleanMsg.includes('unisex') || cleanMsg.includes('oud') || cleanMsg.includes('amber')) {
    return (
      `Hello ${firstName}, welcome to B Perfume Haute Parfumerie ✨\n\n` +
      `Our Unisex masterpiece, **Oud Royale Extrait**, balances rare Cambodian agarwood with warm amber crystals, formulated at pure Extrait concentration to ensure a persistent **12-hour long-lasting aura**.\n\n` +
      `Would you like to explore our full unisex catalog, or would you prefer a private scent consultation with your assigned fragrance advisor?`
    )
  }

  // 2. Pricing or order inquiries
  if (cleanMsg.includes('price') || cleanMsg.includes('order') || cleanMsg.includes('buy') || cleanMsg.includes('cost')) {
    return (
      `Dear ${firstName}, thank you for your interest in B Perfume 🛍️\n\n` +
      `All our creations are crafted as **Extrait de Parfum (12-Hour Long-Lasting)**:\n` +
      `• **CITYMAN Extrait de Parfum (100ml):** Signature Masculine Blend\n` +
      `• **Velvet Rose Pour Femme (100ml):** Royal Floral Elegance\n` +
      `• **Oud Royale Extrait (50ml):** Rare Agarwood Prestige\n\n` +
      `Your personal fragrance advisor is reviewing your request and will share our exclusive pricing and direct ordering link in just a moment!`
    )
  }

  // 3. Default luxury welcome & scent category offering
  return (
    `Dear ${firstName}, welcome to B Perfume Haute Parfumerie ⚜️\n\n` +
    `Thank you for connecting with our private client atelier. Every B Perfume fragrance is handcrafted with rare botanical essences and an ultra-concentrated **12-hour long-lasting formulation**.\n\n` +
    `To assist you with bespoke curation, which category may we present today?\n` +
    `1️⃣ **Men's Collection** (featuring our acclaimed *CITYMAN Extrait de Parfum*)\n` +
    `2️⃣ **Women's Collection** (featuring *Velvet Rose Pour Femme*)\n` +
    `3️⃣ **Unisex & Oriental Prestige** (featuring *Oud Royale & Amber Blanc*)\n\n` +
    `Kindly reply with your preference and your dedicated advisor will curate your selection immediately.`
  )
}
