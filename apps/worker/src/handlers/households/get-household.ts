import type { HouseholdDTO } from '@/contracts'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings, HouseholdRole } from '@/types'

export const getHousehold = async (
  env: AppBindings['Bindings'],
  householdId: string,
  role: HouseholdRole,
  locale: SupportedLocale,
): Promise<HouseholdDTO> => {
  const household = await findHouseholdById(env.DB, householdId)

  if (!household) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    id: household.id,
    name: household.name,
    slug: household.slug,
    defaultCurrencyCode: household.defaultCurrencyCode,
    timezone: household.timezone,
    defaultVisibility: household.defaultVisibility,
    role,
    createdAt: household.createdAt,
  }
}
