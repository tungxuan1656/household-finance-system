import type { ExpenseGroupDTO } from '@/contracts'
import { findExpenseGroupById } from '@/db/repositories/expense-group-repository'
import { notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const getExpenseGroup = async (
  env: AppBindings['Bindings'],
  groupId: string,
  locale: SupportedLocale,
): Promise<ExpenseGroupDTO> => {
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
