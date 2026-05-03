import type { ExpenseGroupDTO, ListExpenseGroupsResponse } from '@/contracts'
import { listExpenseGroupsByHousehold } from '@/db/repositories/expense-group-repository'
import type { AppBindings } from '@/types'

export const listExpenseGroups = async (
  env: AppBindings['Bindings'],
  householdId: string,
): Promise<ListExpenseGroupsResponse> => {
  const groups = await listExpenseGroupsByHousehold(env.DB, householdId)

  return {
    items: groups.map(
      (g): ExpenseGroupDTO => ({
        id: g.id,
        name: g.name,
        description: g.description,
        status: g.status,
        startDate: g.startDate,
        endDate: g.endDate,
        eventBudgetMinor: g.eventBudgetMinor,
        totalSpendMinor: g.totalSpendMinor,
        householdId: g.householdId,
        createdByUserId: g.createdByUserId,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }),
    ),
  }
}
