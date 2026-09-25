'use client'
import { SessionProvider } from 'next-auth/react'
import { PWAProvider } from '@/components/shared/PWAProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PWAProvider>{children}</PWAProvider>
    </SessionProvider>
  )
}

