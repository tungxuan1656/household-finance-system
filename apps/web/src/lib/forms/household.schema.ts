import { z } from 'zod'

import { t } from '@/lib/i18n'

export const createHouseholdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, t('app.onboarding.errors.nameRequired'))
    .max(120, t('app.onboarding.errors.nameTooLong')),
  defaultCurrencyCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{3}$/, t('app.onboarding.errors.currencyInvalid'))
    .transform((value) => value.toUpperCase()),
})

export type CreateHouseholdFormValues = z.infer<typeof createHouseholdSchema>
