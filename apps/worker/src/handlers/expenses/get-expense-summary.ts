import type { Context } from 'hono'

import { expenseListQuerySchema } from '@/contracts'
import { summarizeExpenses } from '@/db/repositories/expense-query-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type GetExpenseSummaryHandlerCtx = Context<AppBindings>

export const getExpenseSummaryHandler = async (
  ctx: GetExpenseSummaryHandlerCtx,
): Promise<{
  totalSpendMinor: number
  expenseCount: number
  currencyCode: string
}> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const parsed = expenseListQuerySchema().safeParse(ctx.req.query())

  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  const query = parsed.data
  if (query.household_id) {
    const membership = await findActiveHouseholdMembership(
      ctx.env.DB,
      currentUser.id,
      query.household_id,
    )

    if (!membership) {
      throw forbidden(locale, 'errors.forbidden')
    }
  }

  const result = await summarizeExpenses(ctx.env.DB, {
    userId: currentUser.id,
    householdId: query.household_id,
    dateFrom: query.date_from,
    dateTo: query.date_to,
    categoryKey: query.category_key,
    payerId: query.payer_id,
    visibility: query.visibility,
    groupId: query.group_id,
    query: query.query,
    amountMin: query.amount_min,
    amountMax: query.amount_max,
    creatorId: query.creator_id,
  })

  return result
}
