import { z } from 'zod'

import { defaultLocale, type SupportedLocale, translate } from '@/lib/i18n'

const currencyCodeSchema = (locale: SupportedLocale = defaultLocale) =>
  z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z]{3}$/,
      translate(locale, 'households.defaultCurrencyCodeInvalid'),
    )
    .transform((value) => value.toUpperCase())

export const createHouseholdRequestSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, translate(locale, 'households.nameMustNotBeBlank'))
        .max(120, translate(locale, 'households.nameTooLong')),
      defaultCurrencyCode: currencyCodeSchema(locale),
    })
    .strict()

export const householdPathParamsSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      id: z
        .string()
        .trim()
        .min(1, translate(locale, 'households.householdIdMustNotBeBlank')),
    })
    .strict()

export type CreateHouseholdRequest = z.output<
  ReturnType<typeof createHouseholdRequestSchema>
>

export type HouseholdRoleDTO = 'admin' | 'member'

export interface HouseholdDTO {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  role: HouseholdRoleDTO
  createdAt: number
}

export interface ListHouseholdsResponse {
  items: HouseholdDTO[]
}
