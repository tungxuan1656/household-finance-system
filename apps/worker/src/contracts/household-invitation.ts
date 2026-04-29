import { z } from 'zod'

import { defaultLocale, type SupportedLocale, translate } from '@/lib/i18n'

export const createHouseholdInvitationRequestSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      invitedRole: z.enum(['admin', 'member'], {
        message: translate(locale, 'invitations.invalidRole'),
      }),
      expiresIn: z
        .enum(['24h', '72h', '7d'], {
          message: translate(locale, 'invitations.invalidExpiresIn'),
        })
        .default('72h'),
    })
    .strict()

export const householdInvitationPathParamsSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      token: z
        .string()
        .trim()
        .min(1, translate(locale, 'invitations.invalidToken')),
    })
    .strict()

export type CreateHouseholdInvitationRequest = z.output<
  ReturnType<typeof createHouseholdInvitationRequestSchema>
>

export interface CreateHouseholdInvitationResponse {
  inviteUrl: string
  expiresAt: number
}

export interface HouseholdInvitationPreviewResponse {
  householdName: string
  invitedRole: 'admin' | 'member'
  expiresAt: number
}

export interface AcceptHouseholdInvitationResponse {
  householdId: string
}
