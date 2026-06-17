import { retrieveLaunchParams } from '@tma.js/sdk'
import { useMemo } from 'react'

/**
 * Reads the Telegram Mini App start_param from launch parameters.
 * When a user opens the TMA via a deep link like
 * `https://t.me/<bot>?startapp=<token>`, the token appears here.
 *
 * Returns the invitation token string, or undefined if no start_param is present.
 */
export const useInvitationDeepLink = (): string | undefined => {
  return useMemo(() => {
    try {
      const { tgWebAppData } = retrieveLaunchParams()

      return tgWebAppData?.start_param ?? undefined
    } catch {
      return undefined
    }
  }, [])
}
