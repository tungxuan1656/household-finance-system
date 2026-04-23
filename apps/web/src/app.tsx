import '@/lib/i18n'

import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { bootstrapAuthSession } from '@/lib/auth/session-service'
import { AppRoutes } from '@/router'

function AuthSessionBootstrapper() {
  useEffect(() => {
    void bootstrapAuthSession()
  }, [])

  return null
}

export function App() {
  return (
    <BrowserRouter>
      <AuthSessionBootstrapper />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
