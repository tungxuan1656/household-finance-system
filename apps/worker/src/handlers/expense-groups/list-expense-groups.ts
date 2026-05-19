import type { Context } from 'hono'

import type { ExpenseGroupDTO, ListExpenseGroupsResponse } from '@/contracts'
import {
  listExpenseGroupsByHousehold,
  listExpenseGroupsByOwner,
} from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import type { AppBindings } from '@/types'

type ListExpenseGroupsHandlerCtx = Context<AppBindings>

export const listExpenseGroupsHandler = async (
  ctx: ListExpenseGroupsHandlerCtx,
): Promise<ListExpenseGroupsResponse> => {
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const householdId = ctx.req.query('household_id')?.trim()
  const groups = householdId
    ? (await findActiveHouseholdMembership(db, currentUser.id, householdId))
      ? await listExpenseGroupsByHousehold(db, householdId)
      : []
    : await listExpenseGroupsByOwner(db, currentUser.id)

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
