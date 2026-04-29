import { removeHouseholdMember } from '@/db/repositories/household-membership-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const handleRemoveHouseholdMember = async (
  env: AppBindings['Bindings'],
  householdId: string,
  targetUserId: string,
  locale: SupportedLocale,
): Promise<{ removed: true }> => {
  const removed = await removeHouseholdMember(env.DB, householdId, targetUserId)

  if (!removed) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { removed: true }
}
