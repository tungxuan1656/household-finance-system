import { type ReactNode, useEffect, useRef } from 'react'

import type { AuthApiClient } from '@/lib/auth/api'
import type { AuthStorage } from '@/lib/storage/adapter'

import { RefreshInterceptor } from './refresh-interceptor'
import { useAuthStore } from './store'

const PROACTIVE_REFRESH_LEAD_MS = 60_000
const PROACTIVE_REFRESH_INTERVAL_MS = 30_000

export interface AuthInterceptorInitProps {
  api: AuthApiClient
  storage: AuthStorage
  children: ReactNode
}

/**
 * Instantiates the RefreshInterceptor once after auth bootstrap completes
 * and sets up a proactive token-refresh interval.
 *
 * Must be rendered inside an authenticated AuthBootstrap subtree
 * so the auth store already has a valid session.
 */
export const AuthInterceptorInit = ({
  api,
  storage,
  children,
}: AuthInterceptorInitProps) => {
  const interceptorRef = useRef<RefreshInterceptor | null>(null)

  useEffect(() => {
    if (interceptorRef.current) {
      return
    }

    const interceptor = new RefreshInterceptor({ api, storage })
    interceptorRef.current = interceptor

    const intervalId = setInterval(() => {
      const state = useAuthStore.getState()

      if (
        state.status !== 'authenticated' ||
        !state.accessTokenExpiresAt ||
        !state.refreshToken
      ) {
        return
      }

      const msUntilExpiry = state.accessTokenExpiresAt - Date.now()

      if (msUntilExpiry > PROACTIVE_REFRESH_LEAD_MS) {
        return
      }

      // Fire-and-forget: the interceptor handles dedup and store updates.
      void interceptor.triggerRefresh()
    }, PROACTIVE_REFRESH_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
      interceptor.dispose()
      interceptorRef.current = null
    }
  }, [api, storage])

  return <>{children}</>
}
