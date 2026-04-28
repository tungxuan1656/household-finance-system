import type { DeleteHouseholdResponse } from '@/contracts'
import { countActiveHouseholdMembers } from '@/db/repositories/household-membership-repository'
import { archiveHouseholdById } from '@/db/repositories/household-repository'
import { conflict, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const archiveHousehold = async (
  env: AppBindings['Bindings'],
  householdId: string,
  locale: SupportedLocale,
): Promise<DeleteHouseholdResponse> => {
  const activeMemberCount = await countActiveHouseholdMembers(
    env.DB,
    householdId,
  )

  if (activeMemberCount > 1) {
    throw conflict(locale, 'households.deleteBlockedByActiveMembers')
  }

  const archived = await archiveHouseholdById(env.DB, householdId)

  if (!archived) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    archived: true,
  }
}
