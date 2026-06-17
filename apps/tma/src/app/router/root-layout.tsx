import { backButton, miniApp } from '@tma.js/sdk'
import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

export default function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = useMemo(
    () => location.pathname === TMA_PATHS.root,
    [location.pathname],
  )

  useEffect(() => {
    if (!backButton.isSupported()) {
      return
    }

    const offClick = backButton.onClick(() => {
      impact('light')
      if (isHome) {
        miniApp.close.ifAvailable()
      } else {
        navigate(-1)
      }
    })
    if (!isHome) {
      backButton.show()
    }

    return () => {
      offClick()
      backButton.hide()
    }
  }, [navigate, isHome])

  return <Outlet />
}
