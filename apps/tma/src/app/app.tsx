import { useEffect, useMemo } from 'react'

import { AppProviders } from '@/app/bootstrap/app-providers'
import { teardownTelegram } from '@/app/bootstrap/telegram-init'
import { AppRouter } from '@/app/router/app-router'
import { AuthBootstrap } from '@/features/auth/bootstrap'
import { createAuthApiBootstrapDeps } from '@/features/auth/bootstrap-deps'
import { FatalLaunchScreen } from '@/features/auth/fatal-launch-screen'
import { useAuthStore } from '@/features/auth/store'
import { createTmaAuthClient } from '@/lib/auth/client'
import {
  DEFAULT_LOCALE,
  detectTelegramLocale,
  i18n,
  type SupportedLocale,
} from '@/lib/i18n'
import { readRawInitData } from '@/lib/telegram/launch-params'

const workerBaseUrl = import.meta.env.VITE_WORKER_URL ?? '/api/v1'

export interface AppProps {
  startupError?: Error | null
  telegramCleanup: () => void
}

export const App = ({ startupError = null, telegramCleanup }: AppProps) => {
  // Apply locale once on mount (SDK already initialized in main.tsx)
  useEffect(() => {
    if (startupError) {
      return () => {
        teardownTelegram(telegramCleanup)
      }
    }

    const locale: SupportedLocale = detectTelegramLocale() ?? DEFAULT_LOCALE

    void i18n.changeLanguage(locale).then(() => {
      document.documentElement.lang = locale
    })

    return () => {
      teardownTelegram(telegramCleanup)
    }
  }, [telegramCleanup])

  const authClient = useMemo(
    () =>
      createTmaAuthClient({
        baseUrl: workerBaseUrl,
        accessTokenProvider: () => useAuthStore.getState().accessToken,
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

  if (startupError) {
    return (
      <AppProviders>
        <FatalLaunchScreen
          error={{ code: 'launchInvalid', message: startupError.message }}
        />
      </AppProviders>
    )
  }

  return (
    <AppProviders>
      <AuthBootstrap deps={bootstrapDeps}>
        <AppRouter />
      </AuthBootstrap>
    </AppProviders>
  )
}
