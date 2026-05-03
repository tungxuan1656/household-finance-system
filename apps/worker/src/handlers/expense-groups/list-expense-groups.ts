import type { Context } from 'hono'

import type { ExpenseGroupDTO, ListExpenseGroupsResponse } from '@/contracts'
import { listExpenseGroupsByHousehold } from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type ListExpenseGroupsHandlerCtx = Context<AppBindings>

export const listExpenseGroupsHandler = async (
  ctx: ListExpenseGroupsHandlerCtx,
): Promise<ListExpenseGroupsResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const householdId = ctx.req.query('household_id')

  if (!householdId?.trim()) {
    throw invalidInput(locale, 'errors.invalidRequestBody', {
      formErrors: [],
      fieldErrors: { household_id: ['Required'] },
    })
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    householdId.trim(),
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const groups = await listExpenseGroupsByHousehold(db, householdId.trim())

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
