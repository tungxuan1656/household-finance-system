import { z } from 'zod'

import { defaultLocale, type SupportedLocale, translate } from '@/lib/i18n'

export const createUpdateProfileRequestSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      displayName: z
        .string()
        .trim()
        .min(1, translate(locale, 'profile.displayNameMustNotBeBlank'))
        .max(100, translate(locale, 'profile.displayNameTooLong'))
        .nullable()
        .optional(),
      avatarUrl: z.url().nullable().optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.displayName !== undefined || value.avatarUrl !== undefined,
      {
        message: translate(locale, 'profile.atLeastOneProfileField'),
      },
    )

export const updateProfileRequestSchema = createUpdateProfileRequestSchema()

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export interface ProfileResponse {
  createdAt: number
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
}
