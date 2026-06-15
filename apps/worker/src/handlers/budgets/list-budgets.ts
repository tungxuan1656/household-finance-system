import type { Context } from 'hono'

import type { ListBudgetsResponse } from '@/contracts'
import { budgetListQuerySchema } from '@/contracts'
import {
  findBudgetLimits,
  findHouseholdBudgetByPeriod,
  findPersonalBudgetByPeriod,
  listAccessibleBudgets,
  listBudgetsByHousehold,
  listBudgetsByOwner,
} from '@/db/repositories/budget-repository'
import type { StoredBudget } from '@/db/repositories/budget-row-mapper'
import {
  findActiveHouseholdMembership,
  listActiveHouseholdIdsForUser,
} from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type ListBudgetsHandlerCtx = Context<AppBindings>

const toBudgetDto = async (db: D1Database, budget: StoredBudget) => {
  const limits = await findBudgetLimits(db, budget.id)

  return {
    id: budget.id,
    scope: budget.scope,
    householdId: budget.householdId,
    ownerUserId: budget.ownerUserId,
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
}

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

  const { household_id: householdId, scope, period } = query.data

  // Case 1: Explicit household_id filter — household scope, single household
  if (householdId) {
    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      householdId,
    )
    if (!membership) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    let budgets: StoredBudget[]
    if (period) {
      const budget = await findHouseholdBudgetByPeriod(db, householdId, period)
      budgets = budget ? [budget] : []
    } else {
      budgets = await listBudgetsByHousehold(db, householdId)
    }

    const items = await Promise.all(
      budgets.map((budget) => toBudgetDto(db, budget)),
    )

    return { items }
  }

  // Case 2: scope=personal (no household_id)
  if (scope === 'personal') {
    let budgets: StoredBudget[]
    if (period) {
      const budget = await findPersonalBudgetByPeriod(
        db,
        currentUser.id,
        period,
      )
      budgets = budget ? [budget] : []
    } else {
      budgets = await listBudgetsByOwner(db, currentUser.id)
    }

    const items = await Promise.all(
      budgets.map((budget) => toBudgetDto(db, budget)),
    )

    return { items }
  }

  // Case 3: scope=household (no household_id) — list across all active households
  if (scope === 'household') {
    const householdIds = await listActiveHouseholdIdsForUser(db, currentUser.id)
    const allBudgets: StoredBudget[] = []
    for (const hid of householdIds) {
      const budgets = await listBudgetsByHousehold(db, hid)
      allBudgets.push(...budgets)
    }

    allBudgets.sort((a, b) =>
      a.budgetMonth < b.budgetMonth
        ? 1
        : a.budgetMonth > b.budgetMonth
          ? -1
          : 0,
    )

    let filtered = allBudgets
    if (period) {
      filtered = allBudgets.filter((b) => b.budgetMonth === period)
    }

    const items = await Promise.all(
      filtered.map((budget) => toBudgetDto(db, budget)),
    )

    return { items }
  }

  // Case 4: No filter — union personal + all households' budgets (sorted by period DESC)
  const householdIds = await listActiveHouseholdIdsForUser(db, currentUser.id)
  const budgets = await listAccessibleBudgets(db, currentUser.id, householdIds)

  const filtered = period
    ? budgets.filter((b) => b.budgetMonth === period)
    : budgets

  const items = await Promise.all(
    filtered.map((budget) => toBudgetDto(db, budget)),
  )

  return { items }
}
