// B Perfume Haute Parfumerie CRM — Ultra-Resilient Service Worker
const CACHE_VERSION = 'bperfume-v5-fixed'
const STATIC_CACHE = `${CACHE_VERSION}-static`

// 1. Install: Activate immediately without waiting for existing tabs to close
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// 2. Activate: Instantly purge all legacy caches (including any broken v3-enterprise caches) and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (!key.startsWith(CACHE_VERSION)) {
              return caches.delete(key)
            }
            return null
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// 3. Fetch: Strict native pass-through for all page navigations and API calls
self.addEventListener('fetch', (event) => {
  // Pass all non-GET requests directly to network
  if (event.request.method !== 'GET') return

  // CRITICAL: NEVER intercept HTML page navigations (mode === 'navigate').
  // By returning here without event.respondWith(), the browser natively handles
  // all redirects (HTTP 307 to /login), auth cookies, and Next.js SSR without any ERR_FAILED risk.
  if (event.request.mode === 'navigate') {
    return
  }

  const url = new URL(event.request.url)

  // Pass all dynamic routes and API requests directly to network
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/data') ||
    url.searchParams.has('nocache')
  ) {
    return
  }

  // Safe cache-first for static immutable assets (CSS, images, icons, fonts)
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches
        .open(STATIC_CACHE)
        .then(async (cache) => {
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
        .catch(() => fetch(event.request))
    )
  }
})
