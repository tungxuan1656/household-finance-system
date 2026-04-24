import { Navigate, Outlet } from 'react-router-dom'

import { AUTH_DEFAULT_REDIRECT_PATH } from '@/lib/constants/auth'
import { useAuthStore } from '@/stores/auth.store'

function PublicRoute() {
  const isSessionChecked = useAuthStore.use.isSessionChecked()
  const isAuthenticated = useAuthStore.use.isAuthenticated()

  if (!isSessionChecked) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate replace to={AUTH_DEFAULT_REDIRECT_PATH} />
  }

  return <Outlet />
}

export { PublicRoute }
