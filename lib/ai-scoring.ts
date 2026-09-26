export type SentimentType = 'Interested' | 'Enthusiastic' | 'Price-Sensitive' | 'Frustrated' | 'Neutral'

export interface SentimentAnalysisResult {
  sentiment: SentimentType
  emoji: string
  color: string
  bg: string
  summary: string
}

export interface PredictiveScoreResult {
  score: number // 0 to 100
  tier: 'HIGH_INTENT' | 'QUALIFIED' | 'EARLY_STAGE' | 'CHURN_RISK'
  label: string
  color: string
  bg: string
  probabilityText: string
  reasons: string[]
}

const SENTIMENT_KEYWORDS: Record<SentimentType, string[]> = {
  Enthusiastic: ['ready to buy', 'love this', 'sign up', 'excellent', 'amazing', 'perfect', 'start now', 'asap', 'invoice'],
  Interested: ['proposal', 'pricing', 'more info', 'details', 'interested', 'call', 'meeting', 'quote', 'brochure'],
  'Price-Sensitive': ['too expensive', 'discount', 'cost', 'budget', 'cheaper', 'offer', 'deal', 'afford', 'coupon'],
  Frustrated: ['unhappy', 'slow', 'waiting', 'no reply', 'cancel', 'bad', 'problem', 'delay', 'issue', 'complaint'],
  Neutral: [],
}

export function analyzeSentiment(messages: { body: string; direction: string }[]): SentimentAnalysisResult {
  const inboundTexts = messages
    .filter(m => m.direction === 'INBOUND')
    .map(m => m.body.toLowerCase())
    .join(' ')

  if (!inboundTexts) {
    return {
      sentiment: 'Neutral',
      emoji: '⚖️',
      color: '#64748b',
      bg: '#f1f5f9',
      summary: 'Initial discovery phase. No customer messages yet.',
    }
  }

  for (const keyword of SENTIMENT_KEYWORDS.Frustrated) {
    if (inboundTexts.includes(keyword)) {
      return {
        sentiment: 'Frustrated',
        emoji: '🚨',
        color: '#ef4444',
        bg: '#fee2e2',
        summary: 'Customer expressed friction or urgency. Requires senior handling.',
      }
    }
  }

  for (const keyword of SENTIMENT_KEYWORDS.Enthusiastic) {
    if (inboundTexts.includes(keyword)) {
      return {
        sentiment: 'Enthusiastic',
        emoji: '🔥',
        color: '#10b981',
        bg: '#ecfdf5',
        summary: 'High buying intent detected. Ready for immediate closing.',
      }
    }
  }

  for (const keyword of SENTIMENT_KEYWORDS['Price-Sensitive']) {
    if (inboundTexts.includes(keyword)) {
      return {
        sentiment: 'Price-Sensitive',
        emoji: '🏷️',
        color: '#f59e0b',
        bg: '#fef3c7',
        summary: 'Negotiating rates. Recommend customized enterprise tier or discount.',
      }
    }
  }

  for (const keyword of SENTIMENT_KEYWORDS.Interested) {
    if (inboundTexts.includes(keyword)) {
      return {
        sentiment: 'Interested',
        emoji: '✨',
        color: '#3b82f6',
        bg: '#eff6ff',
        summary: 'Positive inquiry. Exploring proposals and service options.',
      }
    }
  }

  return {
    sentiment: 'Interested',
    emoji: '👍',
    color: '#3b82f6',
    bg: '#eff6ff',
    summary: 'Standard active exploration. Engaged in communication.',
  }
}

export function calculatePredictiveScore(lead: {
  stage: string
  tag: string
  conversation?: { messages: { body: string; direction: string; createdAt: string }[] }
}): PredictiveScoreResult {
  const msgs = lead.conversation?.messages ?? []
  const sentiment = analyzeSentiment(msgs)

  let score = 25 // base baseline
  const reasons: string[] = []

  // Tag scoring
  if (lead.tag === 'HOT') {
    score += 35
    reasons.push('HOT priority qualification (+35)')
  } else if (lead.tag === 'WARM') {
    score += 20
    reasons.push('WARM lead engagement (+20)')
  } else {
    score += 5
  }

  // Stage scoring
  if (lead.stage === 'ORDER_PLACED') {
    score += 25
    reasons.push('Order placed / invoice generated (+25)')
  } else if (lead.stage === 'TALKING') {
    score += 15
    reasons.push('Under active consultation (+15)')
  } else if (lead.stage === 'DONE') {
    score += 30
    reasons.push('Deals won (+30)')
  }

  // Message activity
  const inboundCount = msgs.filter(m => m.direction === 'INBOUND').length
  if (inboundCount >= 3) {
    score += 10
    reasons.push('High dialogue interaction (+10)')
  } else if (inboundCount >= 1) {
    score += 5
  }

  // Sentiment modifier
  if (sentiment.sentiment === 'Enthusiastic') {
    score += 10
    reasons.push('Enthusiastic purchase readiness (+10)')
  } else if (sentiment.sentiment === 'Frustrated') {
    score -= 15
    reasons.push('Frustration / churn warning (-15)')
  }

  // Clamp 0 - 100
  score = Math.min(Math.max(score, 12), 98)

  if (score >= 80) {
    return {
      score,
      tier: 'HIGH_INTENT',
      label: 'High Intent',
      color: '#10b981',
      bg: '#ecfdf5',
      probabilityText: `${score}% Close Probability`,
      reasons,
    }
  } else if (score >= 60) {
    return {
      score,
      tier: 'QUALIFIED',
      label: 'Qualified',
      color: '#C9A84C',
      bg: '#FDF6E3',
      probabilityText: `${score}% Close Probability`,
      reasons,
    }
  } else if (score >= 40) {
    return {
      score,
      tier: 'EARLY_STAGE',
      label: 'Early Stage',
      color: '#3b82f6',
      bg: '#eff6ff',
      probabilityText: `${score}% Close Probability`,
      reasons,
    }
  } else {
    return {
      score,
      tier: 'CHURN_RISK',
      label: 'At Risk',
      color: '#ef4444',
      bg: '#fee2e2',
      probabilityText: `${score}% Close Probability`,
      reasons,
    }
  }
}

export interface SmartReplySuggestion {
  id: string
  label: string
  text: string
  intent: 'PRICING' | 'NOTES' | 'SHIPPING' | 'SAMPLE' | 'FOLLOWUP'
}

/**
 * Generates context-aware smart reply suggestions based on the last customer message
 */
export function generateSmartReplies(lead: any, customerMessage?: string): SmartReplySuggestion[] {
  const msg = (customerMessage || '').toLowerCase()
  const name = lead?.name?.split(' ')[0] || 'Valued Guest'
  const pref = lead?.fragrancePreference || 'CITYMAN Extrait'

  const suggestions: SmartReplySuggestion[] = []

  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('rate')) {
    suggestions.push({
      id: 'price-1',
      label: '💰 Quote 50ml & 100ml',
      text: `Dear ${name}, our ${pref} is ₹2,800 (50ml) and ₹4,200 (100ml Extrait de Parfum) with complimentary pan-India boutique delivery. May I reserve a flacon for you?`,
      intent: 'PRICING',
    })
    suggestions.push({
      id: 'price-2',
      label: '🎁 VIP Gifting Offer',
      text: `Dear ${name}, if you reserve 2 flacons today, we include complimentary miniature travel atomizers and luxury velvet packaging.`,
      intent: 'DISCOUNT' as any,
    })
  } else if (msg.includes('strong') || msg.includes('hard') || msg.includes('last') || msg.includes('hours') || msg.includes('projection')) {
    suggestions.push({
      id: 'longevity-1',
      label: '⚡ 12-Hour Longevity Guarantee',
      text: `Hello ${name}! All B Perfume Extraits feature 35% pure perfume oils, guaranteeing 12+ hours of commanding sillage even in humid Indian weather.`,
      intent: 'NOTES',
    })
    suggestions.push({
      id: 'longevity-2',
      label: '🌿 Scent Notes Breakdown',
      text: `Dear ${name}, ${pref} opens with fresh spicy notes, evolving into rich tobacco and smoky agarwood. It is formulated specifically for all-day projection.`,
      intent: 'NOTES',
    })
  } else if (msg.includes('delivery') || msg.includes('ship') || msg.includes('track') || msg.includes('when')) {
    suggestions.push({
      id: 'ship-1',
      label: '📦 Express Dispatch Info',
      text: `Hello ${name}, orders placed before 3 PM are dispatched same-day via BlueDart Express (2-3 business days delivery across all Indian metros).`,
      intent: 'SHIPPING',
    })
  } else {
    // Default smart contextual prompts
    suggestions.push({
      id: 'default-1',
      label: `✨ Recommend ${pref}`,
      text: `Hello ${name}! Thank you for contacting B Perfume. For your refined taste, ${pref} is our most sought-after creation. Would you like a fragrance breakdown?`,
      intent: 'NOTES',
    })
    suggestions.push({
      id: 'default-2',
      label: '🧪 Discovery Sample Set',
      text: `Dear ${name}, would you like us to dispatch our 5-Piece Haute Parfumerie Discovery Discovery Set to sample at home before choosing your signature flacon?`,
      intent: 'SAMPLE',
    })
    suggestions.push({
      id: 'default-3',
      label: '📅 Follow-up Touchpoint',
      text: `Hi ${name}, checking in to see if you have any questions regarding your fragrance selection. I am at your service!`,
      intent: 'FOLLOWUP',
    })
  }

  return suggestions
}

/**
 * Analyzes chat sentiment and auto-scores lead tag as 'HOT', 'WARM', or 'COLD'
 */
export function calculateAutoTag(lead: any, messages: any[]): 'HOT' | 'WARM' | 'COLD' {
  const sentiment = analyzeSentiment(messages)
  const score = calculatePredictiveScore(lead)

  if (score.score >= 70 || sentiment.sentiment === 'Enthusiastic' || lead.stage === 'ORDER_PLACED') {
    return 'HOT'
  } else if (score.score >= 40 || sentiment.sentiment === 'Interested') {
    return 'WARM'
  } else {
    return 'COLD'
  }
}

