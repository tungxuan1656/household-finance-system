import type {
  UpdateMemberRoleRequest,
  UpdateMemberRoleResponse,
} from '@/contracts'
import { updateHouseholdMemberRole } from '@/db/repositories/household-membership-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const updateMemberRole = async (
  env: AppBindings['Bindings'],
  householdId: string,
  userId: string,
  locale: SupportedLocale,
  body: UpdateMemberRoleRequest,
): Promise<UpdateMemberRoleResponse> => {
  const updated = await updateHouseholdMemberRole(
    env.DB,
    householdId,
    userId,
    body.role,
  )

  if (!updated) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { updated: true }
}
