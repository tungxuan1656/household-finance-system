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
      defaultCurrencyCode: currencyCodeSchema(locale).optional().default('VND'),
    })
    .strict()

// IANA timezone validation: prefer Intl.supportedValuesOf (V8/Workers), fall back
// to formatting a fixed date which forces timezone resolution and throws on invalid values.
// Note: some valid IANA aliases (e.g. Asia/Ho_Chi_Minh) may not appear in
// supportedValuesOf in all runtimes; we use it as an allow-list but always
// confirm via DateTimeFormat.format() as authoritative check.
const isValidIanaTimezone = (value: string): boolean => {
  // Authoritative check: format a concrete date to force the runtime to resolve
  // the timezone. An invalid timezone causes a RangeError.
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(new Date(0))

    return true
  } catch {
    return false
  }
}

export const updateHouseholdRequestSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, translate(locale, 'households.nameMustNotBeBlank'))
        .max(120, translate(locale, 'households.nameTooLong'))
        .optional(),
      defaultCurrencyCode: currencyCodeSchema(locale).optional(),
      timezone: z
        .string()
        .trim()
        .refine(isValidIanaTimezone, {
          message: translate(locale, 'households.timezoneInvalid'),
        })
        .optional(),
      avatarUrl: z.url().nullable().optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.name !== undefined ||
        value.defaultCurrencyCode !== undefined ||
        value.timezone !== undefined ||
        value.avatarUrl !== undefined,
      {
        message: translate(locale, 'households.atLeastOneFieldRequired'),
      },
    )

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
export type UpdateHouseholdRequest = z.output<
  ReturnType<typeof updateHouseholdRequestSchema>
>

export type HouseholdRoleDTO = 'admin' | 'member'

export interface HouseholdDTO {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  defaultCurrencyCode: string
  timezone: string
  role: HouseholdRoleDTO
  createdAt: number
}

export interface ListHouseholdsResponse {
  items: HouseholdDTO[]
}

export interface DeleteHouseholdResponse {
  archived: true
}

export interface HouseholdMemberDTO {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: HouseholdRoleDTO
  joinedAt: number
}

export interface ListHouseholdMembersResponse {
  items: HouseholdMemberDTO[]
}

export interface UpdateMemberRoleResponse {
  updated: true
}

export const updateMemberRoleRequestSchema = z.object({
  role: z.enum(['admin', 'member']),
})

export type UpdateMemberRoleRequest = z.infer<
  typeof updateMemberRoleRequestSchema
>
