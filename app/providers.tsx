'use client'
import { SessionProvider } from 'next-auth/react'
import { PWAProvider } from '@/components/shared/PWAProvider'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PWAProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#0F172A',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: '#FFFFFF',
            },
          }}
        />
      </PWAProvider>
    </SessionProvider>
  )
}

