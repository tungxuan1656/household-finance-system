import type { DeleteHouseholdResponse } from '@/contracts'
import { archiveHouseholdForAdmin } from '@/db/repositories/household-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const archiveHousehold = async (
  env: AppBindings['Bindings'],
  userId: string,
  householdId: string,
  locale: SupportedLocale,
): Promise<DeleteHouseholdResponse> => {
  const archived = await archiveHouseholdForAdmin(env.DB, userId, householdId)

  if (!archived) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    archived: true,
  }
}
