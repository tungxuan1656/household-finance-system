import { backButton, miniApp } from '@tma.js/sdk'
import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useInvitationDeepLinkRedirect } from '@/features/invitations/hooks/use-invitation-deep-link-redirect'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

export default function RootLayout() {
  useInvitationDeepLinkRedirect()

  const navigate = useNavigate()
  const location = useLocation()
  const isHome = useMemo(
    () => location.pathname === TMA_PATHS.root,
    [location.pathname],
  )
  // The invitation accept route is a deep-link entry point with no
  // in-app history. Per native-ui-and-navigation-pattern.md, root
  // routes with no meaningful back target must own their BackButton
  // (the page closes the mini app instead of navigating back).
  const isInvitationAcceptRoute = useMemo(
    () =>
      location.pathname === TMA_PATHS.invitations ||
      location.pathname.startsWith(`${TMA_PATHS.invitations}/`),
    [location.pathname],
  )

  useEffect(() => {
    if (!backButton.isSupported()) {
      return
    }

    if (isInvitationAcceptRoute) {
      // AcceptInvitationPage mounts its own BackButton that closes the
      // mini app. Do not bind a navigate(-1) handler at the root.
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
  }, [navigate, isHome, isInvitationAcceptRoute])

  return <Outlet />
}
