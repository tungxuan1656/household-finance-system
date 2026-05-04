import type { Context } from 'hono'

import type { ListBudgetsResponse } from '@/contracts'
import { budgetListQuerySchema } from '@/contracts'
import {
  findBudgetByPeriod,
  findBudgetLimits,
  listBudgetsByHousehold,
} from '@/db/repositories/budget-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type ListBudgetsHandlerCtx = Context<AppBindings>

export const listBudgetsHandler = async (
  ctx: ListBudgetsHandlerCtx,
): Promise<ListBudgetsResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const query = budgetListQuerySchema().safeParse(ctx.req.query())
  if (!query.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(query.error.issues, locale),
    )
  }

  const { household_id: householdId, period } = query.data

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  let budgets
  if (period) {
    const budget = await findBudgetByPeriod(db, householdId, period)
    budgets = budget ? [budget] : []
  } else {
    budgets = await listBudgetsByHousehold(db, householdId)
  }

  const items = await Promise.all(
    budgets.map(async (budget) => {
      const limits = await findBudgetLimits(db, budget.id)

      return {
        id: budget.id,
        householdId: budget.householdId,
        period: budget.budgetMonth,
        totalLimitMinor: budget.totalLimitMinor,
        currencyCode: budget.currencyCode,
        categoryLimits: limits.map((l) => ({
          categoryKey: l.categoryKey!,
          limitMinor: l.limitMinor,
        })),
        createdByUserId: budget.createdByUserId,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      }
    }),
  )

  return { items }
}
