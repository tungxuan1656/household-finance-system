import { useEffect, useRef, useState } from 'react'

import { type AuthBootstrapDeps, runAuthBootstrap } from './bootstrap-deps'
import { FatalLaunchScreen } from './fatal-launch-screen'
import { useAuthStore } from './store'

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

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    let cancelled = false

    void runAuthBootstrap(deps).then((result) => {
      if (!cancelled && result === 'authenticated') {
        setHydrated(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [deps])

  if (!hydrated) {
    if (status === 'error') {
      return <FatalLaunchScreen error={error} />
    }

    return <>{loadingFallback ?? null}</>
  }

  return <>{children}</>
}
