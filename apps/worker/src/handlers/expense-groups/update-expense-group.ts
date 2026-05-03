import type { ExpenseGroupDTO, UpdateExpenseGroupRequest } from '@/contracts'
import {
  findExpenseGroupById,
  updateExpenseGroup as updateExpenseGroupRepo,
} from '@/db/repositories/expense-group-repository'
import { forbidden, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import { canManageGroups } from '@/lib/permissions/household-policy'
import type { AppBindings, HouseholdRole } from '@/types'

export const updateExpenseGroup = async (
  env: AppBindings['Bindings'],
  groupId: string,
  role: HouseholdRole,
  locale: SupportedLocale,
  input: UpdateExpenseGroupRequest,
): Promise<ExpenseGroupDTO> => {
  if (!canManageGroups(role)) {
    throw forbidden(locale, 'errors.forbidden')
  }

  const updated = await updateExpenseGroupRepo(env.DB, groupId, {
    name: input.name,
    description:
      input.description !== undefined ? input.description : undefined,
    startDate: input.startDate !== undefined ? input.startDate : undefined,
    endDate: input.endDate !== undefined ? input.endDate : undefined,
    eventBudgetMinor:
      input.eventBudget !== undefined ? input.eventBudget : undefined,
  })

  if (!updated) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const group = await findExpenseGroupById(env.DB, groupId)

  if (!group) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    status: group.status,
    startDate: group.startDate,
    endDate: group.endDate,
    eventBudgetMinor: group.eventBudgetMinor,
    totalSpendMinor: group.totalSpendMinor,
    householdId: group.householdId,
    createdByUserId: group.createdByUserId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  }
}
