'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

import { AUTH_SIGN_IN_PATH } from '@/lib/constants/auth'
import { t } from '@/lib/i18n/t'
import { useAuthStore } from '@/stores/auth.store'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const isSessionChecked = useAuthStore.use.isSessionChecked()

  useEffect(() => {
    if (isSessionChecked && !isAuthenticated) {
      router.replace(AUTH_SIGN_IN_PATH)
    }
  }, [isAuthenticated, isSessionChecked, router])

  if (!isSessionChecked) {
    return (
      <div className='flex min-h-[50svh] items-center justify-center'>
        <div className='space-y-2 rounded-none border border-border/70 bg-background/85 p-6 text-center shadow-sm'>
          <p className='font-heading text-lg'>
            {t('auth.session.loadingTitle')}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('auth.session.loadingDescription')}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export { ProtectedRoute }
