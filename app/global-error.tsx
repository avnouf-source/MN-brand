'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log root crash for monitoring
    console.error('[B Perfume Global Crash Intercepted]:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: 'linear-gradient(135deg, #0A0F1D 0%, #151D2F 100%)',
          color: '#FFFFFF',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '20px',
            padding: '36px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C9A84C',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            B
          </div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '8px',
            }}
          >
            System Recovery
          </span>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '22px',
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            Application Safely Intercepted
          </h1>
          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#94A3B8',
            }}
          >
            A network or rendering anomaly occurred. Your CRM session and data are secure. Click below to refresh your workspace.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #C9A84C 0%, #D4AF37 100%)',
                color: '#0A0F1D',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(201, 168, 76, 0.3)',
              }}
            >
              Refresh Workspace
            </button>
            <button
              onClick={() => {
                window.location.href = '/'
              }}
              style={{
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
