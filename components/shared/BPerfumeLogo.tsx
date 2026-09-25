'use client'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark' | 'gold'
  className?: string
}

/**
 * Text-Only Logo: Clean, elegant typography-based text name: 'B Perfume'
 * Completely eliminates image-based logo components, SVG shapes, icons, and graphic placeholders.
 */
export function BPerfumeLogo({ size = 'md', variant = 'dark', className = '' }: Props) {
  const isDark = variant === 'dark'
  const isGold = variant === 'gold'

  const color = isGold ? '#C9A84C' : isDark ? '#FFFFFF' : '#0A0F1D'

  const sizeClasses = {
    sm: 'text-sm tracking-wider',
    md: 'text-lg tracking-wider',
    lg: 'text-2xl tracking-widest',
    xl: 'text-3xl tracking-widest',
  }

  return (
    <span
      style={{
        color,
        fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
        letterSpacing: '0.08em',
      }}
      className={`font-semibold inline-block select-none ${sizeClasses[size]} ${className}`}
    >
      B Perfume
    </span>
  )
}

/** Horizontal text-only wordmark */
export function BPerfumeWordmark({
  variant = 'dark',
  className = '',
}: {
  variant?: 'light' | 'dark' | 'gold'
  className?: string
}) {
  const isDark = variant === 'dark'
  const isGold = variant === 'gold'
  const color = isGold ? '#C9A84C' : isDark ? '#FFFFFF' : '#0A0F1D'

  return (
    <div className={`flex flex-col leading-none select-none ${className}`}>
      <span
        style={{
          color,
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          letterSpacing: '0.08em',
        }}
        className="text-base font-semibold"
      >
        B Perfume
      </span>
      <span
        style={{ color: '#C9A84C', letterSpacing: '0.2em' }}
        className="text-[8px] font-semibold uppercase tracking-widest mt-1 opacity-90"
      >
        Haute Parfumerie
      </span>
    </div>
  )
}
