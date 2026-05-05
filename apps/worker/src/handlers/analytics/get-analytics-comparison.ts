import type { Context } from 'hono'

import type { AnalyticsComparisonDTO } from '@/contracts'
import { analyticsComparisonQuerySchema } from '@/contracts'
import { getAnalyticsComparison } from '@/db/repositories/expense-query-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

import { toPeriodRange, toPreviousPeriod } from './period'

type GetAnalyticsComparisonHandlerCtx = Context<AppBindings>

export const getAnalyticsComparisonHandler = async (
  ctx: GetAnalyticsComparisonHandlerCtx,
): Promise<AnalyticsComparisonDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const parsed = analyticsComparisonQuerySchema().safeParse(ctx.req.query())

  if (!parsed.success) {
    throw invalidInput(
      locale,
      undefined,
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

  const currentPeriodRange = toPeriodRange(query.period)
  const previousPeriod = toPreviousPeriod(query.period)
  const previousPeriodRange = toPeriodRange(previousPeriod)

  return getAnalyticsComparison(ctx.env.DB, {
    userId: currentUser.id,
    householdId: query.household_id,
    period: query.period,
    periodStart: currentPeriodRange.start,
    periodEnd: currentPeriodRange.end,
    previousPeriod,
    previousPeriodStart: previousPeriodRange.start,
    previousPeriodEnd: previousPeriodRange.end,
  })
}
