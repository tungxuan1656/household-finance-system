import { useEffect, useState } from 'react'

import { AppProviders } from '@/app/bootstrap/app-providers'
import { initTelegram, teardownTelegram } from '@/app/bootstrap/telegram-init'
import { AppRouter } from '@/app/router/app-router'
import {
  DEFAULT_LOCALE,
  detectTelegramLocale,
  i18n,
  type SupportedLocale,
} from '@/lib/i18n'
import { FatalLaunchPage } from '@/routes/fatal-launch'

export const App = () => {
  const [initError, setInitError] = useState<unknown>(null)

  useEffect(() => {
    let cleanup: (() => void) | null = null

    try {
      cleanup = initTelegram()
    } catch (error) {
      setInitError(error)

      return
    }

    const locale: SupportedLocale = detectTelegramLocale() ?? DEFAULT_LOCALE

    void i18n.changeLanguage(locale).then(() => {
      document.documentElement.lang = locale
    })

    return () => {
      if (cleanup) {
        teardownTelegram(cleanup)
      }
    }
  }, [])

  if (initError) {
    return <FatalLaunchPage />
  }

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
