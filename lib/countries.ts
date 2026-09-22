export const COUNTRIES = [
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia',         code: 'SA', dial: '+966', flag: '🇸🇦' },
  { name: 'Kuwait',               code: 'KW', dial: '+965', flag: '🇰🇼' },
  { name: 'Qatar',                code: 'QA', dial: '+974', flag: '🇶🇦' },
  { name: 'Bahrain',              code: 'BH', dial: '+973', flag: '🇧🇭' },
  { name: 'Oman',                 code: 'OM', dial: '+968', flag: '🇴🇲' },
  { name: 'Jordan',               code: 'JO', dial: '+962', flag: '🇯🇴' },
  { name: 'Egypt',                code: 'EG', dial: '+20',  flag: '🇪🇬' },
  { name: 'Lebanon',              code: 'LB', dial: '+961', flag: '🇱🇧' },
  { name: 'Morocco',              code: 'MA', dial: '+212', flag: '🇲🇦' },
  { name: 'United Kingdom',       code: 'GB', dial: '+44',  flag: '🇬🇧' },
  { name: 'United States',        code: 'US', dial: '+1',   flag: '🇺🇸' },
  { name: 'Canada',               code: 'CA', dial: '+1',   flag: '🇨🇦' },
  { name: 'France',               code: 'FR', dial: '+33',  flag: '🇫🇷' },
  { name: 'Germany',              code: 'DE', dial: '+49',  flag: '🇩🇪' },
  { name: 'Italy',                code: 'IT', dial: '+39',  flag: '🇮🇹' },
  { name: 'Spain',                code: 'ES', dial: '+34',  flag: '🇪🇸' },
  { name: 'Netherlands',          code: 'NL', dial: '+31',  flag: '🇳🇱' },
  { name: 'Sweden',               code: 'SE', dial: '+46',  flag: '🇸🇪' },
  { name: 'Switzerland',          code: 'CH', dial: '+41',  flag: '🇨🇭' },
  { name: 'Turkey',               code: 'TR', dial: '+90',  flag: '🇹🇷' },
  { name: 'Russia',               code: 'RU', dial: '+7',   flag: '🇷🇺' },
  { name: 'India',                code: 'IN', dial: '+91',  flag: '🇮🇳' },
  { name: 'Pakistan',             code: 'PK', dial: '+92',  flag: '🇵🇰' },
  { name: 'Bangladesh',           code: 'BD', dial: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka',            code: 'LK', dial: '+94',  flag: '🇱🇰' },
  { name: 'China',                code: 'CN', dial: '+86',  flag: '🇨🇳' },
  { name: 'Japan',                code: 'JP', dial: '+81',  flag: '🇯🇵' },
  { name: 'South Korea',          code: 'KR', dial: '+82',  flag: '🇰🇷' },
  { name: 'Singapore',            code: 'SG', dial: '+65',  flag: '🇸🇬' },
  { name: 'Malaysia',             code: 'MY', dial: '+60',  flag: '🇲🇾' },
  { name: 'Indonesia',            code: 'ID', dial: '+62',  flag: '🇮🇩' },
  { name: 'Philippines',          code: 'PH', dial: '+63',  flag: '🇵🇭' },
  { name: 'Australia',            code: 'AU', dial: '+61',  flag: '🇦🇺' },
  { name: 'Brazil',               code: 'BR', dial: '+55',  flag: '🇧🇷' },
  { name: 'Mexico',               code: 'MX', dial: '+52',  flag: '🇲🇽' },
  { name: 'Argentina',            code: 'AR', dial: '+54',  flag: '🇦🇷' },
  { name: 'South Africa',         code: 'ZA', dial: '+27',  flag: '🇿🇦' },
  { name: 'Nigeria',              code: 'NG', dial: '+234', flag: '🇳🇬' },
  { name: 'Kenya',                code: 'KE', dial: '+254', flag: '🇰🇪' },
]

export type Country = typeof COUNTRIES[number]

export function parsePhone(phone: string): { country: Country | null; local: string } {
  if (!phone?.startsWith('+')) return { country: null, local: phone ?? '' }
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  for (const c of sorted) {
    if (phone.startsWith(c.dial)) return { country: c, local: phone.slice(c.dial.length) }
  }
  return { country: null, local: phone }
}

export function formatPhoneDisplay(phone: string): string {
  const { country, local } = parsePhone(phone)
  if (!country) return phone
  const digits = local.replace(/\D/g, '')
  const groups = digits.match(/.{1,3}/g) ?? [local]
  return `${country.dial} ${groups.join(' ')}`
}

export function waLink(phone: string, message = ''): string {
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}
