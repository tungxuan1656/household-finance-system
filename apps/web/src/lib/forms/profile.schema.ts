import { z } from 'zod'

import { t } from '@/lib/i18n'

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, t('app.settings.profile.errors.displayNameRequired'))
    .max(100, t('app.settings.profile.errors.displayNameTooLong')),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
