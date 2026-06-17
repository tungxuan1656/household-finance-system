import { retrieveLaunchParams } from '@tma.js/sdk'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { getInvitationAcceptPath } from '@/lib/constants/routes'

/**
 * Reads the Telegram Mini App start_param and redirects to the
 * accept-invitation page when an invitation token is present.
 *
 * Should be called once at the app root (e.g., RootLayout) so that
 * opening the TMA via `https://t.me/<bot>?startapp=<token>` lands
 * the user on the accept page immediately.
 */
export const useInvitationDeepLinkRedirect = (): void => {
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return

    try {
      const { tgWebAppData } = retrieveLaunchParams()
      const startParam = tgWebAppData?.start_param

      if (startParam) {
        hasRedirected.current = true
        navigate(getInvitationAcceptPath(startParam), { replace: true })
      }
    } catch {
      // Not running inside Telegram — ignore
    }
  }, [navigate])
}
