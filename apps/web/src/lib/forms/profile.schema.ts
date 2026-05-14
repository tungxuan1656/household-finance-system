import { z } from 'zod'

import { t } from '@/lib/i18n/t'

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, t('app.settings.profile.errors.displayNameRequired'))
    .max(100, t('app.settings.profile.errors.displayNameTooLong')),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        1,
        t('app.settings.profile.security.errors.currentPasswordRequired'),
      ),
    newPassword: z
      .string()
      .min(8, t('app.settings.profile.security.errors.newPasswordTooShort')),
    confirmPassword: z
      .string()
      .min(
        1,
        t('app.settings.profile.security.errors.confirmPasswordRequired'),
      ),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: t('app.settings.profile.security.errors.passwordMismatch'),
    path: ['confirmPassword'],
  })

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
