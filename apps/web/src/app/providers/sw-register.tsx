'use client'

import { useEffect } from 'react'

const SERVICE_WORKER_URL = '/sw.js'

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    if (!('serviceWorker' in navigator)) {
      return
    }

    void navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: '/',
    })
  }, [])

  return null
}
