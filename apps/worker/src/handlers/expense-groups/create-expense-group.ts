import type { CreateExpenseGroupRequest, ExpenseGroupDTO } from '@/contracts'
import { createExpenseGroup as createExpenseGroupRepo } from '@/db/repositories/expense-group-repository'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const createExpenseGroup = async (
  env: AppBindings['Bindings'],
  userId: string,
  householdId: string,
  locale: SupportedLocale,
  input: CreateExpenseGroupRequest,
): Promise<ExpenseGroupDTO> => {
  const created = await createExpenseGroupRepo(env.DB, {
    householdId,
    name: input.name,
    description: input.description ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    eventBudgetMinor: input.eventBudget ?? null,
    createdByUserId: userId,
  })

  return {
    id: created.id,
    name: created.name,
    description: created.description,
    status: created.status,
    startDate: created.startDate,
    endDate: created.endDate,
    eventBudgetMinor: created.eventBudgetMinor,
    totalSpendMinor: created.totalSpendMinor,
    householdId: created.householdId,
    createdByUserId: created.createdByUserId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }
}
