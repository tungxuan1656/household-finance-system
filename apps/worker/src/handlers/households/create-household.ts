import type { CreateHouseholdRequest, HouseholdDTO } from '@/contracts'
import { createHouseholdForUser } from '@/db/repositories/household-repository'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const createHousehold = async (
  env: AppBindings['Bindings'],
  userId: string,
  locale: SupportedLocale,
  input: CreateHouseholdRequest,
): Promise<HouseholdDTO> => {
  const household = await createHouseholdForUser(env.DB, userId, input, locale)

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
