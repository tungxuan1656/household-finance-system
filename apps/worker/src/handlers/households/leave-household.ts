import {
  countAdmins,
  findMembershipByUserAndHousehold,
  leaveHousehold,
} from '@/db/repositories/household-membership-repository'
import { conflict, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const handleLeaveHousehold = async (
  env: AppBindings['Bindings'],
  householdId: string,
  userId: string,
  locale: SupportedLocale,
): Promise<{ left: true }> => {
  const adminCount = await countAdmins(env.DB, householdId)
  const membership = await findMembershipByUserAndHousehold(
    env.DB,
    householdId,
    userId,
  )

  if (adminCount <= 1 && membership?.role === 'admin') {
    throw conflict(locale, 'households.cannotLeaveAsLastAdmin')
  }

  const left = await leaveHousehold(env.DB, householdId, userId)

  if (!left) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { left: true }
}
