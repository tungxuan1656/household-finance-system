import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { t } from '@/lib/i18n'
import { authActions, useAuthStore } from '@/stores/auth.store'

function ShellGuard() {
  const location = useLocation()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const bootstrapComplete = useAuthStore.use.bootstrapComplete()
  const fullPath = `${location.pathname}${location.search}${location.hash}`

  useEffect(() => {
    if (bootstrapComplete && !isAuthenticated) {
      authActions.setReturnTo(fullPath)
    }
  }, [
    bootstrapComplete,
    fullPath,
    isAuthenticated,
    location.hash,
    location.pathname,
    location.search,
  ])

  if (!bootstrapComplete) {
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
    return <Navigate replace state={{ from: fullPath }} to='/sign-in' />
  }

  return <Outlet />
}

export { ShellGuard }
