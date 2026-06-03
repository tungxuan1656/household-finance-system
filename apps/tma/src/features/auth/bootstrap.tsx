import { useEffect, useRef, useState } from 'react'

import { LoadingFallback } from '@/components/shared/loading-fallback'

import {
  type AuthBootstrapDeps,
  type AuthBootstrapPhase,
  runAuthBootstrap,
} from './bootstrap-deps'
import { FatalLaunchScreen } from './fatal-launch-screen'
import { useAuthStore } from './store'

const BOOTSTRAP_TIMEOUT_MS = 15_000

export interface AuthBootstrapProps {
  deps: AuthBootstrapDeps
  children: React.ReactNode
  loadingFallback?: React.ReactNode
}

export const AuthBootstrap = ({
  deps,
  children,
  loadingFallback,
}: AuthBootstrapProps) => {
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const startedRef = useRef(false)
  const [hydrated, setHydrated] = useState(false)
  const [phase, setPhase] = useState<AuthBootstrapPhase | 'timeout'>('start')

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    let cancelled = false
    const timeoutId = setTimeout(() => {
      if (cancelled) {
        return
      }

      cancelled = true
      setPhase('timeout')
      useAuthStore.getState().setError({ code: 'networkError' })
      deps.onFatal?.()
    }, BOOTSTRAP_TIMEOUT_MS)

    void runAuthBootstrap({
      ...deps,
      onPhase: (nextPhase) => {
        if (!cancelled) {
          setPhase(nextPhase)
        }
      },
    })
      .then((result) => {
        clearTimeout(timeoutId)
        if (!cancelled && result === 'authenticated') {
          setHydrated(true)
        }
      })
      .catch(() => {
        clearTimeout(timeoutId)
        if (!cancelled) {
          useAuthStore.getState().setError({ code: 'networkError' })
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [deps])

  if (!hydrated) {
    if (status === 'error') {
      return <FatalLaunchScreen error={error} />
    }

    return <>{loadingFallback ?? <LoadingFallback phase={phase} />}</>
  }

  return <>{children}</>
}
