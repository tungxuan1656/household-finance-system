// Service Worker for Household Finance System
const CACHE_NAME = 'hfs-static-v1' // Reset to v1 for a clean start

const CACHEABLE_DESTINATIONS = new Set([
  'style',
  'script',
  'image',
  'font',
  'manifest',
])

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    return
  }

  if (event.request.mode === 'navigate') {
    return
  }

  if (!CACHEABLE_DESTINATIONS.has(event.request.destination)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse
        }

        const responseCopy = networkResponse.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseCopy)
        })

        return networkResponse
      })
    }),
  )
})
