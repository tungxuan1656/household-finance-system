'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

import { AUTH_DEFAULT_REDIRECT_PATH } from '@/lib/constants/auth'
import { useAuthStore } from '@/stores/auth.store'

function PublicRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isSessionChecked = useAuthStore.use.isSessionChecked()
  const isAuthenticated = useAuthStore.use.isAuthenticated()

  useEffect(() => {
    if (isSessionChecked && isAuthenticated) {
      router.replace(AUTH_DEFAULT_REDIRECT_PATH)
    }
  }, [isAuthenticated, isSessionChecked, router])

  if (!isSessionChecked || isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export { PublicRoute }
