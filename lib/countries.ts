export interface Country {
  name: string
  code: string
  dial: string
  flag: string
  timezone: string
  currency: string
}

export const COUNTRIES: Country[] = [
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪', timezone: 'Asia/Dubai', currency: 'AED' },
  { name: 'Saudi Arabia',         code: 'SA', dial: '+966', flag: '🇸🇦', timezone: 'Asia/Riyadh', currency: 'SAR' },
  { name: 'Kuwait',               code: 'KW', dial: '+965', flag: '🇰🇼', timezone: 'Asia/Kuwait', currency: 'KWD' },
  { name: 'Qatar',                code: 'QA', dial: '+974', flag: '🇶🇦', timezone: 'Asia/Qatar', currency: 'QAR' },
  { name: 'Bahrain',              code: 'BH', dial: '+973', flag: '🇧🇭', timezone: 'Asia/Bahrain', currency: 'BHD' },
  { name: 'Oman',                 code: 'OM', dial: '+968', flag: '🇴🇲', timezone: 'Asia/Muscat', currency: 'OMR' },
  { name: 'Jordan',               code: 'JO', dial: '+962', flag: '🇯🇴', timezone: 'Asia/Amman', currency: 'JOD' },
  { name: 'Egypt',                code: 'EG', dial: '+20',  flag: '🇪🇬', timezone: 'Africa/Cairo', currency: 'EGP' },
  { name: 'Lebanon',              code: 'LB', dial: '+961', flag: '🇱🇧', timezone: 'Asia/Beirut', currency: 'USD' },
  { name: 'Morocco',              code: 'MA', dial: '+212', flag: '🇲🇦', timezone: 'Africa/Casablanca', currency: 'MAD' },
  { name: 'United Kingdom',       code: 'GB', dial: '+44',  flag: '🇬🇧', timezone: 'Europe/London', currency: 'GBP' },
  { name: 'United States',        code: 'US', dial: '+1',   flag: '🇺🇸', timezone: 'America/New_York', currency: 'USD' },
  { name: 'Canada',               code: 'CA', dial: '+1',   flag: '🇨🇦', timezone: 'America/Toronto', currency: 'CAD' },
  { name: 'France',               code: 'FR', dial: '+33',  flag: '🇫🇷', timezone: 'Europe/Paris', currency: 'EUR' },
  { name: 'Germany',              code: 'DE', dial: '+49',  flag: '🇩🇪', timezone: 'Europe/Berlin', currency: 'EUR' },
  { name: 'Italy',                code: 'IT', dial: '+39',  flag: '🇮🇹', timezone: 'Europe/Rome', currency: 'EUR' },
  { name: 'Spain',                code: 'ES', dial: '+34',  flag: '🇪🇸', timezone: 'Europe/Madrid', currency: 'EUR' },
  { name: 'Netherlands',          code: 'NL', dial: '+31',  flag: '🇳🇱', timezone: 'Europe/Amsterdam', currency: 'EUR' },
  { name: 'Sweden',               code: 'SE', dial: '+46',  flag: '🇸🇪', timezone: 'Europe/Stockholm', currency: 'SEK' },
  { name: 'Switzerland',          code: 'CH', dial: '+41',  flag: '🇨🇭', timezone: 'Europe/Zurich', currency: 'CHF' },
  { name: 'Turkey',               code: 'TR', dial: '+90',  flag: '🇹🇷', timezone: 'Europe/Istanbul', currency: 'TRY' },
  { name: 'Russia',               code: 'RU', dial: '+7',   flag: '🇷🇺', timezone: 'Europe/Moscow', currency: 'RUB' },
  { name: 'India',                code: 'IN', dial: '+91',  flag: '🇮🇳', timezone: 'Asia/Kolkata', currency: 'INR' },
  { name: 'Pakistan',             code: 'PK', dial: '+92',  flag: '🇵🇰', timezone: 'Asia/Karachi', currency: 'PKR' },
  { name: 'Bangladesh',           code: 'BD', dial: '+880', flag: '🇧🇩', timezone: 'Asia/Dhaka', currency: 'BDT' },
  { name: 'Sri Lanka',            code: 'LK', dial: '+94',  flag: '🇱🇰', timezone: 'Asia/Colombo', currency: 'LKR' },
  { name: 'China',                code: 'CN', dial: '+86',  flag: '🇨🇳', timezone: 'Asia/Shanghai', currency: 'CNY' },
  { name: 'Japan',                code: 'JP', dial: '+81',  flag: '🇯🇵', timezone: 'Asia/Tokyo', currency: 'JPY' },
  { name: 'South Korea',          code: 'KR', dial: '+82',  flag: '🇰🇷', timezone: 'Asia/Seoul', currency: 'KRW' },
  { name: 'Singapore',            code: 'SG', dial: '+65',  flag: '🇸🇬', timezone: 'Asia/Singapore', currency: 'SGD' },
  { name: 'Malaysia',             code: 'MY', dial: '+60',  flag: '🇲🇾', timezone: 'Asia/Kuala_Lumpur', currency: 'MYR' },
  { name: 'Indonesia',            code: 'ID', dial: '+62',  flag: '🇮🇩', timezone: 'Asia/Jakarta', currency: 'IDR' },
  { name: 'Philippines',          code: 'PH', dial: '+63',  flag: '🇵🇭', timezone: 'Asia/Manila', currency: 'PHP' },
  { name: 'Australia',            code: 'AU', dial: '+61',  flag: '🇦🇺', timezone: 'Australia/Sydney', currency: 'AUD' },
  { name: 'Brazil',               code: 'BR', dial: '+55',  flag: '🇧🇷', timezone: 'America/Sao_Paulo', currency: 'BRL' },
  { name: 'Mexico',               code: 'MX', dial: '+52',  flag: '🇲🇽', timezone: 'America/Mexico_City', currency: 'MXN' },
  { name: 'Argentina',            code: 'AR', dial: '+54',  flag: '🇦🇷', timezone: 'America/Argentina/Buenos_Aires', currency: 'ARS' },
  { name: 'South Africa',         code: 'ZA', dial: '+27',  flag: '🇿🇦', timezone: 'Africa/Johannesburg', currency: 'ZAR' },
  { name: 'Nigeria',              code: 'NG', dial: '+234', flag: '🇳🇬', timezone: 'Africa/Lagos', currency: 'NGN' },
  { name: 'Kenya',                code: 'KE', dial: '+254', flag: '🇰🇪', timezone: 'Africa/Nairobi', currency: 'KES' },
]

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

export interface ClientLocalTimeInfo {
  timeString: string
  status: 'BUSINESS_HOURS' | 'EVENING' | 'SLEEP_HOURS'
  badgeText: string
  color: string
  bg: string
  canCall: boolean
  timezoneName: string
}

export function getCountryLocalTime(phoneOrCountry: string | Country | null): ClientLocalTimeInfo {
  let tz = 'UTC'
  let countryName = 'International'

  if (typeof phoneOrCountry === 'string') {
    const { country } = parsePhone(phoneOrCountry)
    if (country) {
      tz = country.timezone
      countryName = country.name
    }
  } else if (phoneOrCountry && typeof phoneOrCountry === 'object') {
    tz = phoneOrCountry.timezone
    countryName = phoneOrCountry.name
  }

  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    const timeString = formatter.format(now)

    // Calculate 24h hour for status
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    })
    const hour24 = parseInt(hourFormatter.format(now), 10)

    if (hour24 >= 22 || hour24 < 8) {
      return {
        timeString,
        status: 'SLEEP_HOURS',
        badgeText: `🌙 ${timeString} · Client Sleeping (Do Not Call)`,
        color: '#ef4444',
        bg: '#fee2e2',
        canCall: false,
        timezoneName: tz,
      }
    } else if (hour24 >= 18 && hour24 < 22) {
      return {
        timeString,
        status: 'EVENING',
        badgeText: `🌆 ${timeString} · Evening Hours`,
        color: '#f59e0b',
        bg: '#fef3c7',
        canCall: true,
        timezoneName: tz,
      }
    } else {
      return {
        timeString,
        status: 'BUSINESS_HOURS',
        badgeText: `🟢 ${timeString} · Business Hours`,
        color: '#10b981',
        bg: '#ecfdf5',
        canCall: true,
        timezoneName: tz,
      }
    }
  } catch (err) {
    return {
      timeString: 'Active',
      status: 'BUSINESS_HOURS',
      badgeText: '🟢 Client Active',
      color: '#10b981',
      bg: '#ecfdf5',
      canCall: true,
      timezoneName: 'UTC',
    }
  }
}

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  rateAgainstUSD: number
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateAgainstUSD: 3.67 },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal', rateAgainstUSD: 3.75 },
]

export function formatCurrencyValue(amountUSD: number, currencyCode: string = 'USD'): string {
  const curr = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) ?? SUPPORTED_CURRENCIES[0]
  const converted = Math.round(amountUSD * curr.rateAgainstUSD)
  return `${curr.symbol}${converted.toLocaleString()}`
}

export function waLink(phone: string, message = ''): string {
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}
