'use client'

import { useEffect } from 'react'

const SERVICE_WORKER_URL = '/sw.js?v=2'

const clearServiceWorkerState = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  )

  const cacheKeys = await caches.keys()

  await Promise.all(cacheKeys.map((key) => caches.delete(key)))
}

export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    void clearServiceWorkerState().then(() => {
      if (process.env.NODE_ENV !== 'production') {
        return
      }

      void navigator.serviceWorker.register(SERVICE_WORKER_URL, {
        scope: '/',
      })
    })
  }, [])

  return null
}
