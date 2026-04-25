import type { HouseholdDTO } from '@/contracts'
import { findUserHouseholdById } from '@/db/repositories/household-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const getHousehold = async (
  env: AppBindings['Bindings'],
  userId: string,
  householdId: string,
  locale: SupportedLocale,
): Promise<HouseholdDTO> => {
  const household = await findUserHouseholdById(env.DB, userId, householdId)

  if (!household) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    id: household.id,
    name: household.name,
    slug: household.slug,
    defaultCurrencyCode: household.defaultCurrencyCode,
    timezone: household.timezone,
    role: household.role,
    createdAt: household.createdAt,
  }
}
