// B Perfume Haute Parfumerie CRM — Enterprise High-Performance Service Worker
const CACHE_VERSION = 'bperfume-crm-v3-enterprise'
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const STATIC_CACHE = `${CACHE_VERSION}-static`

const PRECACHE_RESOURCES = [
  '/',
  '/login',
  '/agent/workspace',
  '/admin/dashboard',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/globe.svg',
]

// 1. Install Phase: Aggressive Shell Precaching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_RESOURCES)
      } catch (err) {
        console.warn('[B Perfume PWA] Some precache items skipped:', err)
      }
    })
  )
  // Activate worker immediately
  self.skipWaiting()
})

// 2. Activate Phase: Purge Obsolete Caches & Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key)
          }
          return null
        })
      )
    })
  )
  self.clients.claim()
})

// 3. Fetch Phase: Instant Cache-First for Assets & Stale-While-Revalidate for App Shell
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Bypass API routes and telemetry so real-time CRM updates are always live
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/data') ||
    url.searchParams.has('nocache')
  ) {
    return
  }

  // A. Static Assets: Cache-First Strategy (Zero latency for icons, fonts, Next.js chunks, CSS)
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached

        try {
          const networkRes = await fetch(event.request)
          if (networkRes && networkRes.status === 200) {
            cache.put(event.request, networkRes.clone())
          }
          return networkRes
        } catch {
          return cached || new Response('', { status: 408 })
        }
      })
    )
    return
  }

  // B. Navigation Requests (HTML Pages): Stale-While-Revalidate with Instant Cache Shell Return
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE)
        const cachedRes = await cache.match(event.request)

        const fetchPromise = fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(event.request, networkRes.clone())
            }
            return networkRes
          })
          .catch(() => cachedRes)

        // Return instant cached shell if available, otherwise wait for network
        return cachedRes || fetchPromise || caches.match('/login')
      })()
    )
    return
  }

  // C. Fallback for other GET requests
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, networkRes.clone()))
          }
          return networkRes
        })
      )
    })
  )
})
