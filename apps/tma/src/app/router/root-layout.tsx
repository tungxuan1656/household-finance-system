import { backButton } from '@tma.js/sdk'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { impact } from '@/lib/telegram/haptics'

export default function RootLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!backButton.isSupported()) {
      return
    }

    const offClick = backButton.onClick(() => {
      impact('light')
      navigate(-1)
    })
    backButton.show.ifAvailable()

    return () => {
      offClick()
      backButton.hide.ifAvailable()
    }
  }, [navigate])

  return <Outlet />
}
