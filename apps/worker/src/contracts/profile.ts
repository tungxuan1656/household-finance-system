import { z } from 'zod'

import { REFERENCE_SOURCE_KEYS } from '@/contracts/reference-data'
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
      quickAddLastSourceKey: z
        .enum(REFERENCE_SOURCE_KEYS)
        .nullable()
        .optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.displayName !== undefined ||
        value.avatarUrl !== undefined ||
        value.quickAddLastSourceKey !== undefined,
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
  quickAddLastSourceKey: (typeof REFERENCE_SOURCE_KEYS)[number] | null
}
