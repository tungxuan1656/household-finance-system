import { useEffect } from 'react'

import { AppProviders } from '@/app/bootstrap/app-providers'
import { initTelegram, teardownTelegram } from '@/app/bootstrap/telegram-init'
import { AppRouter } from '@/app/router/app-router'

export const App = () => {
  useEffect(() => {
    const cleanup = initTelegram()

    return () => {
      teardownTelegram(cleanup)
    }
  }, [])

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
