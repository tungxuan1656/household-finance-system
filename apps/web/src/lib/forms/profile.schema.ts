import { z } from 'zod'

import { t } from '@/lib/i18n/t'

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, t('app.settings.profile.errors.displayNameRequired'))
    .max(100, t('app.settings.profile.errors.displayNameTooLong')),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>

export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, t('app.settings.profile.security.errors.currentPasswordRequired')),
  newPassword: z
    .string()
    .min(8, t('app.settings.profile.security.errors.newPasswordTooShort')),
})

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
