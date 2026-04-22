import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { authActions, useAuthStore } from '@/stores/auth.store'

function ShellGuard() {
  const location = useLocation()
  const isAuthenticated = useAuthStore.use.isAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) {
      authActions.setReturnTo(location.pathname)
    }
  }, [isAuthenticated, location.pathname])

  if (!isAuthenticated) {
    return (
      <Navigate replace state={{ from: location.pathname }} to='/sign-in' />
    )
  }

  return <Outlet />
}

export { ShellGuard }
