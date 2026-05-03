import type { ArchiveExpenseGroupResponse } from '@/contracts'
import { archiveExpenseGroup as archiveExpenseGroupRepo } from '@/db/repositories/expense-group-repository'
import { forbidden, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import { canManageGroups } from '@/lib/permissions/household-policy'
import type { AppBindings, HouseholdRole } from '@/types'

export const archiveExpenseGroup = async (
  env: AppBindings['Bindings'],
  groupId: string,
  role: HouseholdRole,
  locale: SupportedLocale,
): Promise<ArchiveExpenseGroupResponse> => {
  if (!canManageGroups(role)) {
    throw forbidden(locale, 'errors.forbidden')
  }

  const archived = await archiveExpenseGroupRepo(env.DB, groupId)

  if (!archived) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { archived: true }
}
