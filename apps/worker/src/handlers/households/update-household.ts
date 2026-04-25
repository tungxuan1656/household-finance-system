import type { HouseholdDTO, UpdateHouseholdRequest } from '@/contracts'
import { updateHouseholdForAdmin } from '@/db/repositories/household-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const updateHousehold = async (
  env: AppBindings['Bindings'],
  userId: string,
  householdId: string,
  locale: SupportedLocale,
  input: UpdateHouseholdRequest,
): Promise<HouseholdDTO> => {
  const household = await updateHouseholdForAdmin(
    env.DB,
    userId,
    householdId,
    input,
  )

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
