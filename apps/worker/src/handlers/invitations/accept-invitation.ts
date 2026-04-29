import type { AcceptInvitationResponse } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  consumeInvitationById,
  createMembershipFromInvitation,
  findInvitationPreviewByTokenHash,
} from '@/db/repositories/household-invitation-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { sha256Hex } from '@/lib/auth/security'
import { conflict, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const acceptInvitation = async (
  env: AppBindings['Bindings'],
  input: {
    token: string
    userId: string
    locale: SupportedLocale
  },
): Promise<AcceptInvitationResponse> => {
  const tokenHash = await sha256Hex(input.token)
  const invitation = await findInvitationPreviewByTokenHash(env.DB, tokenHash)

  if (!invitation) {
    throw notFound(input.locale, 'invitations.invalidToken')
  }

  const existingActiveMembership = await findActiveHouseholdMembership(
    env.DB,
    input.userId,
    invitation.householdId,
  )

  if (existingActiveMembership) {
    throw conflict(input.locale, 'invitations.alreadyMember')
  }

  const consumed = await consumeInvitationById(
    env.DB,
    invitation.invitationId,
    input.userId,
  )

  if (!consumed) {
    throw conflict(input.locale, 'invitations.tokenUnavailable')
  }

  const membershipResult = await createMembershipFromInvitation(env.DB, {
    householdId: invitation.householdId,
    userId: input.userId,
    invitedRole: invitation.invitedRole,
    invitedByUserId: invitation.createdByUserId,
  })

  await createAuditLogEntry(env.DB, {
    householdId: invitation.householdId,
    actorUserId: input.userId,
    actionType: 'household.invitation.accepted',
    targetType: 'household_invitation',
    targetId: invitation.invitationId,
    payloadJson: JSON.stringify({
      invitedRole: invitation.invitedRole,
      membershipResult,
    }),
  })

  return {
    householdId: invitation.householdId,
    role: invitation.invitedRole,
  }
}
