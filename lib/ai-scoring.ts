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
