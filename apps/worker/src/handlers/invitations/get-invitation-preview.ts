import type { InvitationPreviewResponse } from '@/contracts'
import { findInvitationPreviewByTokenHash } from '@/db/repositories/household-invitation-repository'
import { sha256Hex } from '@/lib/auth/security'
import { readConfig } from '@/lib/env'
import { conflict, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const getInvitationPreview = async (
  env: AppBindings['Bindings'],
  token: string,
  locale: SupportedLocale,
): Promise<InvitationPreviewResponse> => {
  const config = readConfig(env)
  const tokenHash = await sha256Hex(`${token}.${config.invitationTokenPepper}`)
  const invitation = await findInvitationPreviewByTokenHash(env.DB, tokenHash)

  if (!invitation) {
    throw notFound(locale, 'invitations.invalidToken')
  }

  const nowEpoch = Date.now()

  if (invitation.usedAt !== null || invitation.expiresAt <= nowEpoch) {
    throw conflict(locale, 'invitations.tokenUnavailable')
  }

  return {
    household: {
      id: invitation.householdId,
      name: invitation.householdName,
    },
    invitedRole: invitation.invitedRole,
    expiresAt: invitation.expiresAt,
  }
}
