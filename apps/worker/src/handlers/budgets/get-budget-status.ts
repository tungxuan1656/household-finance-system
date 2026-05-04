import type { Context } from 'hono'

import type { BudgetStatusDTO, BudgetThresholdStatus } from '@/contracts'
import { budgetPathParamsSchema } from '@/contracts'
import {
  findBudgetById,
  findBudgetLimits,
  getBudgetSpendSummary,
} from '@/db/repositories/budget-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type GetBudgetStatusHandlerCtx = Context<AppBindings>

const calculatePercentUsed = (actualMinor: number, plannedMinor: number) => {
  if (plannedMinor <= 0) {
    return 0
  }

  return Math.round((actualMinor / plannedMinor) * 100)
}

const calculateThresholdStatus = (
  percentUsed: number,
): BudgetThresholdStatus => {
  if (percentUsed >= 100) {
    return 'exceeded'
  }

  if (percentUsed >= 80) {
    return 'warning'
  }

  return 'ok'
}

export const getBudgetStatusHandler = async (
  ctx: GetBudgetStatusHandlerCtx,
): Promise<BudgetStatusDTO> => {
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

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    budget.householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const limits = await findBudgetLimits(db, budget.id)
  const categoryKeys = limits.flatMap((limit) =>
    limit.categoryKey ? [limit.categoryKey] : [],
  )

  const spendSummary =
    budget.startDate && budget.endDate
      ? await getBudgetSpendSummary(db, {
          householdId: budget.householdId,
          startDate: budget.startDate,
          endDate: budget.endDate,
          categoryKeys,
        })
      : {
          totalActualMinor: 0,
          categoryActualMinorByKey: {},
        }

  const totalPercentUsed = calculatePercentUsed(
    spendSummary.totalActualMinor,
    budget.totalLimitMinor,
  )

  return {
    budgetId: budget.id,
    householdId: budget.householdId,
    period: budget.budgetMonth,
    currencyCode: budget.currencyCode,
    totalPlannedMinor: budget.totalLimitMinor,
    totalActualMinor: spendSummary.totalActualMinor,
    totalRemainingMinor: budget.totalLimitMinor - spendSummary.totalActualMinor,
    totalPercentUsed,
    totalStatus: calculateThresholdStatus(totalPercentUsed),
    categoryStatuses: limits
      .filter(
        (limit): limit is typeof limit & { categoryKey: string } =>
          typeof limit.categoryKey === 'string',
      )
      .map((limit) => {
        const actualSpendMinor =
          spendSummary.categoryActualMinorByKey[limit.categoryKey] ?? 0
        const percentUsed = calculatePercentUsed(
          actualSpendMinor,
          limit.limitMinor,
        )

        return {
          categoryKey: limit.categoryKey,
          plannedLimitMinor: limit.limitMinor,
          actualSpendMinor,
          remainingMinor: limit.limitMinor - actualSpendMinor,
          percentUsed,
          status: calculateThresholdStatus(percentUsed),
        }
      }),
  }
}
