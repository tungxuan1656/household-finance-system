import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { authActions, useAuthStore } from '@/stores/auth.store'

function ShellGuard() {
  const location = useLocation()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const fullPath = `${location.pathname}${location.search}${location.hash}`

  useEffect(() => {
    if (!isAuthenticated) {
      authActions.setReturnTo(fullPath)
    }
  }, [isAuthenticated, location.pathname, location.search, location.hash])

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: fullPath }} to='/sign-in' />
  }

  return <Outlet />
}

export { ShellGuard }
