import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useShellAccess } from '@/lib/shell-access'

function ShellGuard() {
  const location = useLocation()
  const hasShellAccess = useShellAccess()

  if (!hasShellAccess) {
    return (
      <Navigate replace state={{ from: location.pathname }} to='/sign-in' />
    )
  }

  return <Outlet />
}

export { ShellGuard }
