export interface LeadContext {
  name: string
  company?: string
  businessRequirement?: string
  leadSource?: string
}

export function generateAIAutoReply(lead: LeadContext, customerMessage?: string): string {
  const firstName = lead.name.split(' ')[0] || 'there'
  const companyMention = lead.company ? ` at ${lead.company}` : ''

  if (lead.businessRequirement) {
    return (
      `Hello ${firstName}! 👋 Thank you for reaching out to MN Brand.\n\n` +
      `Our AI assistant noted your interest in: "${lead.businessRequirement}"${companyMention}. ` +
      `We have allocated an international specialist to review your request. ` +
      `Are you available for a brief discovery call today, or would you prefer our comprehensive service deck over WhatsApp?`
    )
  }

  if (customerMessage && customerMessage.toLowerCase().includes('pricing')) {
    return (
      `Hi ${firstName}! 🌟 Thanks for inquiring about MN Brand's global solutions. ` +
      `Our pricing models are tailored to company scale and target markets. ` +
      `A dedicated account manager will be with you in just a moment with our pricing guide.`
    )
  }

  return (
    `Hi ${firstName}! 👋 Welcome to MN Brand Global Solutions. ` +
    `Thank you for contacting us${companyMention}. An enterprise specialist is reviewing your inquiry and will be with you shortly. ` +
    `Feel free to share any specific goals or target regions you are looking to address!`
  )
}
