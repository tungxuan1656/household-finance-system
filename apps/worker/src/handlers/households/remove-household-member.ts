import {
  countAdmins,
  findMembershipByUserAndHousehold,
  removeHouseholdMember,
} from '@/db/repositories/household-membership-repository'
import { conflict, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const handleRemoveHouseholdMember = async (
  env: AppBindings['Bindings'],
  householdId: string,
  targetUserId: string,
  locale: SupportedLocale,
): Promise<{ removed: true }> => {
  const targetMembership = await findMembershipByUserAndHousehold(
    env.DB,
    householdId,
    targetUserId,
  )
  if (!targetMembership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const adminCount = await countAdmins(env.DB, householdId)
  if (targetMembership.role === 'admin' && adminCount <= 1) {
    throw conflict(locale, 'households.cannotRemoveLastAdmin')
  }

  const removed = await removeHouseholdMember(env.DB, householdId, targetUserId)

  if (!removed) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { removed: true }
}
