import { z } from 'zod'

import { defaultLocale, type SupportedLocale, translate } from '@/lib/i18n'

const invitationRoleSchema = (locale: SupportedLocale = defaultLocale) =>
  z.enum(['admin', 'member'], {
    message: translate(locale, 'invitations.invalidRole'),
  })

const invitationTtlHoursSchema = (locale: SupportedLocale = defaultLocale) =>
  z
    .number()
    .int(translate(locale, 'invitations.invalidExpiresIn'))
    .refine(
      (value) => value === 24 || value === 72 || value === 168,
      translate(locale, 'invitations.invalidExpiresIn'),
    )

export const createInvitationRequestSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      role: invitationRoleSchema(locale).optional().default('member'),
      ttlHours: invitationTtlHoursSchema(locale).optional().default(72),
    })
    .strict()

export const invitationTokenPathParamsSchema = (
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

export type CreateInvitationRequest = z.output<
  ReturnType<typeof createInvitationRequestSchema>
>

export type InvitationRoleDTO = 'admin' | 'member'

export interface InvitationCreateResponse {
  invitationId: string
  invitedRole: InvitationRoleDTO
  expiresAt: number
  invitePath: string
  token: string
}

export interface InvitationPreviewResponse {
  household: {
    id: string
    name: string
  }
  invitedRole: InvitationRoleDTO
  expiresAt: number
}

export interface AcceptInvitationResponse {
  householdId: string
  role: InvitationRoleDTO
}
