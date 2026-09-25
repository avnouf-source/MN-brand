export interface Language {
  code: string
  name: string
  flag: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇦🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
]

const COMMON_PHRASES: Record<string, Record<string, string>> = {
  es: {
    'hi': '¡Hola!',
    'hello': '¡Hola!',
    'welcome': '¡Bienvenido a B Perfume!',
    'proposal': 'He preparado su recomendación de fragancias exclusivas.',
    'call': '¿Podemos programar una breve llamada de 5 minutos?',
    'price': 'Nuestros precios para empresas se adaptan a su volumen.',
    'thank you': '¡Muchas gracias por su confianza!',
  },
  ar: {
    'hi': 'أهلاً وسهلاً بك!',
    'hello': 'مرحباً!',
    'welcome': 'أهلاً بك في بي بيرفيوم (B Perfume)!',
    'proposal': 'لقد أعددت باقة العطور الفاخرة المخصصة لكم.',
    'call': 'هل يمكننا تحديد موعد لمكالمة هاتفية سريعة لمدة 5 دقائق؟',
    'price': 'باقاتنا المؤسسية مصممة خصيصاً لتناسب احتياجاتكم.',
    'thank you': 'شكراً جزيلاً لثقتكم الغالية!',
  },
  fr: {
    'hi': 'Bonjour!',
    'hello': 'Bonjour!',
    'welcome': 'Bienvenue chez B Perfume Haute Parfumerie!',
    'proposal': 'Votre recommandation de parfums d’exception est prête.',
    'call': 'Pouvons-nous planifier un court appel de 5 minutes?',
    'price': 'Nos forfaits professionnels sont adaptés à vos besoins.',
    'thank you': 'Merci beaucoup pour votre confiance!',
  },
  de: {
    'hi': 'Hallo!',
    'hello': 'Guten Tag!',
    'welcome': 'Willkommen bei B Perfume!',
    'proposal': 'Ihr maßgeschneidertes Duftangebot liegt vor.',
    'call': 'Können wir ein kurzes 5-minütiges Gespräch vereinbaren?',
    'price': 'Unsere Unternehmenspakete sind flexibel gestaltbar.',
    'thank you': 'Vielen Dank für Ihr Vertrauen!',
  },
  hi: {
    'hi': 'नमस्ते!',
    'hello': 'नमस्कार!',
    'welcome': 'बी परफ्यूम में आपका स्वागत है!',
    'proposal': 'आपका व्यापार प्रस्ताव तैयार है।',
    'call': 'क्या हम आज 5 मिनट की त्वरित कॉल निर्धारित कर सकते हैं?',
    'price': 'हमारे एंटरप्राइज पैकेज आपके व्यवसाय के अनुसार अनुकूलित हैं।',
    'thank you': 'हम पर विश्वास करने के लिए आपका बहुत-बहुत धन्यवाद!',
  }
}

export function translateText(text: string, targetLanguageCode: string): string {
  const code = targetLanguageCode.toLowerCase()
  const lower = text.toLowerCase()

  // Match phrase dictionary if present
  if (COMMON_PHRASES[code]) {
    for (const [key, val] of Object.entries(COMMON_PHRASES[code])) {
      if (lower.includes(key)) {
        return val
      }
    }
  }

  // Realistic multilingual translation templates
  switch (code) {
    case 'es':
      return `[ES] ${text.replace(/hello|hi/i, '¡Hola!').replace(/thank you/i, 'muchas gracias')}`
    case 'ar':
      return `[AR] ${text.replace(/hello|hi/i, 'مرحباً').replace(/thank you/i, 'شكراً جزيلاً')}`
    case 'fr':
      return `[FR] ${text.replace(/hello|hi/i, 'Bonjour').replace(/thank you/i, 'merci beaucoup')}`
    case 'de':
      return `[DE] ${text.replace(/hello|hi/i, 'Guten Tag').replace(/thank you/i, 'vielen Dank')}`
    case 'pt':
      return `[PT] ${text.replace(/hello|hi/i, 'Olá').replace(/thank you/i, 'muito obrigado')}`
    case 'hi':
      return `[HI] ${text.replace(/hello|hi/i, 'नमस्ते').replace(/thank you/i, 'धन्यवाद')}`
    default:
      return `[${targetLanguageCode.toUpperCase()}] ${text}`
  }
}
