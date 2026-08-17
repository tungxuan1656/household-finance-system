import { backButton } from '@tma.js/sdk'
import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useInvitationDeepLinkRedirect } from '@/features/invitations/hooks/use-invitation-deep-link-redirect'
import {
  isInvitationAcceptPathname,
  isRootTabPathname,
  TMA_PATHS,
} from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

export default function RootLayout() {
  useInvitationDeepLinkRedirect()

  const navigate = useNavigate()
  const location = useLocation()
  const isRootTab = useMemo(
    () => isRootTabPathname(location.pathname),
    [location.pathname],
  )
  // The invitation accept route is a deep-link entry point with no
  // in-app history. Per native-ui-and-navigation-pattern.md, root
  // routes with no meaningful back target must own their BackButton
  // (the page closes the mini app instead of navigating back).
  const isInvitationAcceptRoute = useMemo(
    () => isInvitationAcceptPathname(location.pathname),
    [location.pathname],
  )
  const isFatalRoute = location.pathname === TMA_PATHS.fatal
  const hasMeaningfulBackTarget = useMemo(
    () =>
      typeof window !== 'undefined' &&
      ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0,
    [location.key],
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

    if (isRootTab || isFatalRoute || !hasMeaningfulBackTarget) {
      backButton.hide()

      return
    }

    const offClick = backButton.onClick(() => {
      impact('light')
      navigate(-1)
    })
    backButton.show()

    return () => {
      offClick()
      backButton.hide()
    }
  }, [
    navigate,
    isRootTab,
    isInvitationAcceptRoute,
    isFatalRoute,
    hasMeaningfulBackTarget,
  ])

  return <Outlet />
}
