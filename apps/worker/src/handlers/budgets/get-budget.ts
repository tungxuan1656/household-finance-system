import type { Context } from 'hono'

import type { BudgetDTO } from '@/contracts'
import { budgetPathParamsSchema } from '@/contracts'
import {
  findBudgetById,
  findBudgetLimits,
} from '@/db/repositories/budget-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type GetBudgetHandlerCtx = Context<AppBindings>

export const getBudgetHandler = async (
  ctx: GetBudgetHandlerCtx,
): Promise<BudgetDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const budgetId = ctx.req.param('id')

  const params = budgetPathParamsSchema().safeParse({ id: budgetId })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const budget = await findBudgetById(db, params.data.id)
  if (!budget) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  if (budget.scope === 'personal') {
    if (budget.ownerUserId !== currentUser.id) {
      throw notFound(locale, 'errors.resourceNotFound')
    }
  } else {
    if (!budget.householdId) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      budget.householdId,
    )
    if (!membership) {
      throw notFound(locale, 'errors.resourceNotFound')
    }
  }

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
