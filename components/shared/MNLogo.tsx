interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark' | 'gold'
  className?: string
}

const sizes = {
  sm:  { w: 28, h: 28, text: 10, sub: 7 },
  md:  { w: 40, h: 40, text: 14, sub: 9 },
  lg:  { w: 56, h: 56, text: 20, sub: 11 },
  xl:  { w: 80, h: 80, text: 28, sub: 14 },
}

export function MNLogo({ size = 'md', variant = 'dark', className = '' }: Props) {
  const s = sizes[size]
  const isDark = variant === 'dark'
  const isLight = variant === 'light'
  const isGold = variant === 'gold'

  const bg = isDark ? '#0F1729' : isLight ? '#FFFFFF' : '#C9A84C'
  const gold = '#C9A84C'
  const white = '#FFFFFF'
  const navy = '#0F1729'
  const letterColor = isDark ? gold : isLight ? navy : white
  const lineColor = isDark ? gold : isLight ? '#C9A84C' : white

  return (
    <svg
      width={s.w}
      height={s.h}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <rect width="80" height="80" rx="18" fill={bg} />

      {/* Decorative corner lines — top-left */}
      <line x1="8" y1="8" x2="22" y2="8" stroke={lineColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="8" y1="8" x2="8" y2="22" stroke={lineColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Decorative corner lines — bottom-right */}
      <line x1="72" y1="72" x2="58" y2="72" stroke={lineColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="72" y1="72" x2="72" y2="58" stroke={lineColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* M letter */}
      <text
        x="12"
        y="52"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="800"
        fontSize="36"
        fill={letterColor}
        letterSpacing="-1"
      >
        MN
      </text>

      {/* Gold underline accent */}
      <rect x="12" y="56" width="56" height="2.5" rx="1.25" fill={lineColor} opacity="0.8" />

      {/* BRAND text */}
      <text
        x="40"
        y="70"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="600"
        fontSize="9"
        fill={letterColor}
        textAnchor="middle"
        letterSpacing="3"
        opacity="0.9"
      >
        BRAND
      </text>
    </svg>
  )
}

/** Horizontal wordmark for sidebar / headers */
export function MNWordmark({ variant = 'dark', className = '' }: { variant?: 'light' | 'dark'; className?: string }) {
  const navy = '#0F1729'
  const gold = '#C9A84C'
  const textColor = variant === 'dark' ? navy : '#FFFFFF'
  const goldColor = variant === 'dark' ? gold : '#E8C96A'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <MNLogo size="sm" variant={variant === 'dark' ? 'dark' : 'dark'} />
      <div>
        <div className="flex items-baseline gap-0.5">
          <span style={{ color: textColor }} className="text-base font-extrabold tracking-tight leading-none">MN</span>
          <span style={{ color: goldColor }} className="text-base font-extrabold tracking-tight leading-none">Brand</span>
        </div>
        <p style={{ color: goldColor }} className="text-[9px] font-semibold tracking-widest uppercase opacity-80 leading-none mt-0.5">
          Global CRM
        </p>
      </div>
    </div>
  )
}
