import { useEffect, useMemo } from 'react'

import { AppProviders } from '@/app/bootstrap/app-providers'
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
}

export const App = ({ startupError = null }: AppProps) => {
  // Apply locale once on mount (SDK already initialized in main.tsx).
  // Do not teardown Telegram from this effect cleanup: React StrictMode replays
  // mount/cleanup in dev, which would cancel the deferred fullscreen request.
  useEffect(() => {
    if (startupError) {
      return
    }

    const locale: SupportedLocale = detectTelegramLocale() ?? DEFAULT_LOCALE

    void i18n.changeLanguage(locale).then(() => {
      document.documentElement.lang = locale
    })
  }, [startupError])

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
