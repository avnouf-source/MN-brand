interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark' | 'gold'
  className?: string
}

const sizes = {
  sm: { w: 32, h: 32, fontSize: 16, subSize: 6 },
  md: { w: 44, h: 44, fontSize: 22, subSize: 7 },
  lg: { w: 60, h: 60, fontSize: 30, subSize: 8 },
  xl: { w: 88, h: 88, fontSize: 44, subSize: 10 },
}

export function BPerfumeLogo({ size = 'md', variant = 'dark', className = '' }: Props) {
  const s = sizes[size]
  const isDark = variant === 'dark'
  const isLight = variant === 'light'

  const bg = isDark ? '#0A0F1D' : isLight ? '#FBF9F5' : '#C9A84C'
  const gold = '#C9A84C'
  const goldLight = '#E8D5A0'
  const border = isDark ? 'rgba(201,168,76,0.4)' : isLight ? 'rgba(201,168,76,0.3)' : '#FFFFFF'
  const letterColor = isDark ? '#FFFFFF' : isLight ? '#0A0F1D' : '#FFFFFF'

  return (
    <svg
      width={s.w}
      height={s.h}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background with subtle luxury gradient */}
      <rect width="80" height="80" rx="20" fill={bg} />

      {/* Outer Fine Gold Filigree Border */}
      <rect x="5" y="5" width="70" height="70" rx="16" stroke={border} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />

      {/* Inner Elegant Border */}
      <rect x="9" y="9" width="62" height="62" rx="13" stroke={gold} strokeWidth="1.5" opacity="0.9" />

      {/* Decorative Gold Diamonds in Corners */}
      <polygon points="40,11 42,13 40,15 38,13" fill={gold} />
      <polygon points="40,65 42,67 40,69 38,67" fill={gold} />
      <polygon points="12,40 14,42 12,44 10,42" fill={gold} />
      <polygon points="68,40 70,42 68,44 66,42" fill={gold} />

      {/* Monogram 'B' - Luxury Serif */}
      <text
        x="40"
        y="50"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="36"
        fill={letterColor}
        textAnchor="middle"
        letterSpacing="0"
      >
        B
      </text>

      {/* Luxury Gold Divider Crown */}
      <circle cx="35" cy="58" r="1" fill={gold} />
      <circle cx="40" cy="57" r="1.5" fill={goldLight} />
      <circle cx="45" cy="58" r="1" fill={gold} />

      {/* Subtext 'PARFUM' */}
      <text
        x="40"
        y="68"
        fontFamily="'Inter', 'Cinzel', sans-serif"
        fontWeight="600"
        fontSize="7"
        fill={gold}
        textAnchor="middle"
        letterSpacing="3.5"
      >
        PARFUM
      </text>
    </svg>
  )
}

/** Horizontal wordmark for sidebar / headers */
export function BPerfumeWordmark({ variant = 'dark', className = '' }: { variant?: 'light' | 'dark'; className?: string }) {
  const isDark = variant === 'dark'
  const textColor = isDark ? '#FFFFFF' : '#0A0F1D'
  const goldColor = '#C9A84C'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BPerfumeLogo size="sm" variant={isDark ? 'dark' : 'light'} />
      <div>
        <div className="flex items-baseline gap-1.5">
          <span style={{ color: textColor }} className="text-base font-bold tracking-wider font-serif">
            B PERFUME
          </span>
        </div>
        <p style={{ color: goldColor }} className="text-[8.5px] font-semibold tracking-widest uppercase opacity-90 leading-none mt-0.5">
          Haute Parfumerie · Paris
        </p>
      </div>
    </div>
  )
}
