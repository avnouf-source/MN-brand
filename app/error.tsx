'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[B Perfume CRM] Root Error:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: '#090A0F', color: '#FFFFFF' }}
    >
      <div className="space-y-4 max-w-md">
        <p className="text-xs font-semibold tracking-widest uppercase text-amber-400">
          Temporary Exception
        </p>
        <h1
          className="text-3xl font-serif text-white tracking-wide"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Workspace Recovery
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          An unexpected interface state occurred. You can retry the current operation or return to your secure session.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition border border-white/20 hover:bg-white/10 text-white"
          >
            Retry Action
          </button>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition shadow-lg"
            style={{ background: '#C9A84C', color: '#090A0F' }}
          >
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  )
}
