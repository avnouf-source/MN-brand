'use client'
import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Sparkles } from 'lucide-react'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update()
          console.log('[B Perfume PWA] Service Worker registered and checked for updates:', reg.scope)
        })
        .catch((err) => {
          console.warn('[B Perfume PWA] Service Worker registration failed:', err)
        })
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsInstalled(isStandalone)

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(iosDevice && !isStandalone)

    // Capture install prompt on Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      const dismissed = sessionStorage.getItem('bperfume_pwa_dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowBanner(false)
      setInstallPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  async function handleInstallClick() {
    if (!installPrompt) return
    installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setShowBanner(false)
      setIsInstalled(true)
    }
    setInstallPrompt(null)
  }

  function handleDismiss() {
    setShowBanner(false)
    sessionStorage.setItem('bperfume_pwa_dismissed', 'true')
  }

  return (
    <>
      {children}

      {/* Luxury PWA Install Banner for Mobile */}
      {showBanner && !isInstalled && installPrompt && (
        <div className="fixed bottom-16 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className="p-3.5 rounded-2xl shadow-2xl border text-white flex items-center justify-between gap-3"
            style={{
              background: '#0A0F1D',
              borderColor: 'rgba(201, 168, 76, 0.4)',
              boxShadow: '0 20px 40px -15px rgba(10, 15, 29, 0.8), 0 0 20px rgba(201, 168, 76, 0.15)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201, 168, 76, 0.15)', border: '1px solid rgba(201, 168, 76, 0.3)' }}
              >
                <Sparkles size={17} style={{ color: '#C9A84C' }} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold font-serif text-white tracking-wide">
                  Install B Perfume CRM
                </p>
                <p className="text-[10px] text-amber-200/80 truncate">
                  Fast native experience &amp; offline support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                style={{ background: '#C9A84C', color: '#0A0F1D' }}
              >
                Install
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
