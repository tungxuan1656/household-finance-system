import type { ListHouseholdMembersResponse } from '@/contracts'
import { listHouseholdMembers } from '@/db/repositories/household-membership-repository'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const getHouseholdMembers = async (
  env: AppBindings['Bindings'],
  householdId: string,
  _locale: SupportedLocale,
): Promise<ListHouseholdMembersResponse> => {
  const members = await listHouseholdMembers(env.DB, householdId)

  return { items: members }
}
