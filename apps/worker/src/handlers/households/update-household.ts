import type { HouseholdDTO, UpdateHouseholdRequest } from '@/contracts'
import {
  findHouseholdById,
  updateHouseholdById,
} from '@/db/repositories/household-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings, HouseholdRole } from '@/types'

export const updateHousehold = async (
  env: AppBindings['Bindings'],
  householdId: string,
  role: HouseholdRole,
  locale: SupportedLocale,
  input: UpdateHouseholdRequest,
): Promise<HouseholdDTO> => {
  const updated = await updateHouseholdById(env.DB, householdId, input)

  if (!updated) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

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
    role,
    createdAt: household.createdAt,
  }
}
