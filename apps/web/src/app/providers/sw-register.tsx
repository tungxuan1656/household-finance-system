'use client'

import { useEffect } from 'react'

const SERVICE_WORKER_URL = '/sw.js'

export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      const cleanupStaleWorkers = async () => {
        const registrations = await navigator.serviceWorker.getRegistrations()

        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        )

        if (!('caches' in window)) {
          return
        }

        const cacheNames = await caches.keys()

        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        )
      }

      void cleanupStaleWorkers()

      return
    }

    void navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: '/',
    })
  }, [])

  return null
}
