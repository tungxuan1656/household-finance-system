import type { DeleteHouseholdResponse } from '@/contracts'
import { archiveHouseholdById } from '@/db/repositories/household-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const archiveHousehold = async (
  env: AppBindings['Bindings'],
  householdId: string,
  locale: SupportedLocale,
): Promise<DeleteHouseholdResponse> => {
  const archived = await archiveHouseholdById(env.DB, householdId)

  if (!archived) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    archived: true,
  }
}
