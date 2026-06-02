import { useEffect, useMemo, useState } from 'react'

import { AppProviders } from '@/app/bootstrap/app-providers'
import { initTelegram, teardownTelegram } from '@/app/bootstrap/telegram-init'
import { AppRouter } from '@/app/router/app-router'
import { AuthBootstrap } from '@/features/auth/bootstrap'
import { createAuthApiBootstrapDeps } from '@/features/auth/bootstrap-deps'
import { createTmaAuthClient } from '@/lib/auth/client'
import {
  DEFAULT_LOCALE,
  detectTelegramLocale,
  i18n,
  type SupportedLocale,
} from '@/lib/i18n'
import { readRawInitData } from '@/lib/telegram/launch-params'
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

  const authClient = useMemo(
    () =>
      createTmaAuthClient({
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }),
    [],
  )
  const bootstrapDeps = useMemo(
    () =>
      createAuthApiBootstrapDeps({
        api: authClient.api,
        storage: {
          getRefreshToken: () => authClient.storage.getRefreshToken(),
          setRefreshToken: (token) => authClient.storage.setRefreshToken(token),
          clearRefreshToken: () => authClient.storage.clearRefreshToken(),
        },
        readRawInitData,
      }),
    [authClient],
  )

  if (initError) {
    return <FatalLaunchPage />
  }

  return (
    <AppProviders>
      <AuthBootstrap deps={bootstrapDeps}>
        <AppRouter />
      </AuthBootstrap>
    </AppProviders>
  )
}
