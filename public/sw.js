// B Perfume Haute Parfumerie CRM Service Worker
const CACHE_NAME = 'bperfume-crm-v1'
const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[B Perfume SW] Precache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Do not intercept API requests or Next.js server actions
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/data')) {
    return
  }

  // Stale-while-revalidate for static files & fonts
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
            }
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    )
    return
  }

  // Network first with offline cache fallback for navigation pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached
        // Fallback to home/login if offline
        return caches.match('/login')
      })
  )
})
