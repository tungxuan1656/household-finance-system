import { z } from 'zod'

import { t } from '@/lib/i18n/t'

export const createHouseholdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, t('app.onboarding.errors.nameRequired'))
    .max(120, t('app.onboarding.errors.nameTooLong')),
})

export type CreateHouseholdFormValues = z.infer<typeof createHouseholdSchema>

export const updateHouseholdSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, t('app.householdDetail.fields.householdName.label'))
    .max(120),
  defaultCurrencyCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{3}$/)
    .optional(),
  timezone: z.string().trim().min(1).optional(),
  defaultVisibility: z.enum(['private', 'household']).optional(),
})

export type UpdateHouseholdSettingsFormValues = z.infer<
  typeof updateHouseholdSettingsSchema
>
