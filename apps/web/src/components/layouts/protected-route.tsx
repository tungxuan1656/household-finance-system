import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { AUTH_SIGN_IN_PATH } from '@/lib/constants/auth'
import { t } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'

function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const isSessionChecked = useAuthStore.use.isSessionChecked()
  const fullPath = `${location.pathname}${location.search}${location.hash}`

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
    return (
      <Navigate replace state={{ from: fullPath }} to={AUTH_SIGN_IN_PATH} />
    )
  }

  return <Outlet />
}

export { ProtectedRoute }
