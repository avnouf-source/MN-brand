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

// 4. Push Notifications (FCM / Web Push)
self.addEventListener('push', (event) => {
  let data = {
    title: 'B Perfume CRM',
    body: 'New lead batch assigned via Round-Robin distribution.',
    icon: '/icons/icon-192.svg',
    url: '/agent/workspace',
  }
  if (event.data) {
    try {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.icon,
    vibrate: [150, 80, 150],
    data: {
      url: data.url || '/agent/workspace',
    },
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// 5. Notification Click Handler: Focus or open workspace
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/agent/workspace'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/agent/workspace') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
