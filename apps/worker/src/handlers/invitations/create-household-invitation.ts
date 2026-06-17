import type {
  CreateInvitationRequest,
  InvitationCreateResponse,
} from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import { createHouseholdInvitation } from '@/db/repositories/household-invitation-repository'
import { sha256Hex } from '@/lib/auth/security'
import { readConfig } from '@/lib/env'
import type { AppBindings } from '@/types'

const millisecondsPerHour = 60 * 60 * 1000

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const generateInvitationToken = (): string => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)

  return toBase64Url(bytes)
}

export const createInvitation = async (
  env: AppBindings['Bindings'],
  input: {
    actorUserId: string
    householdId: string
    payload: CreateInvitationRequest
  },
): Promise<InvitationCreateResponse> => {
  const config = readConfig(env)

  const token = generateInvitationToken()
  const tokenHash = await sha256Hex(`${token}.${config.invitationTokenPepper}`)
  const expiresAt = Date.now() + input.payload.ttlHours * millisecondsPerHour

  const created = await createHouseholdInvitation(env.DB, {
    householdId: input.householdId,
    tokenHash,
    invitedRole: input.payload.role,
    expiresAt,
    createdByUserId: input.actorUserId,
  })

  await createAuditLogEntry(env.DB, {
    householdId: input.householdId,
    actorUserId: input.actorUserId,
    actionType: 'household.invitation.created',
    targetType: 'household_invitation',
    targetId: created.id,
    payloadJson: JSON.stringify({
      invitedRole: created.invitedRole,
      expiresAt: created.expiresAt,
    }),
  })

  return {
    invitationId: created.id,
    invitedRole: created.invitedRole,
    expiresAt: created.expiresAt,
    invitePath: `/invitations/${token}`,
    token,
  }
}
