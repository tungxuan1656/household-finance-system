import type { Context } from 'hono'

import type { AnalyticsOverviewDTO } from '@/contracts'
import { analyticsOverviewQuerySchema } from '@/contracts'
import { getAnalyticsOverview } from '@/db/repositories/expense-query-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type GetAnalyticsOverviewHandlerCtx = Context<AppBindings>

const toPeriodRange = (period: string) => {
  const [yearValue, monthValue] = period.split('-')
  const year = Number(yearValue)
  const monthIndex = Number(monthValue) - 1

  return {
    start: Date.UTC(year, monthIndex, 1),
    end: Date.UTC(year, monthIndex + 1, 1),
  }
}

export const getAnalyticsOverviewHandler = async (
  ctx: GetAnalyticsOverviewHandlerCtx,
): Promise<AnalyticsOverviewDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const parsed = analyticsOverviewQuerySchema().safeParse(ctx.req.query())

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

  const periodRange = toPeriodRange(query.period)

  return getAnalyticsOverview(ctx.env.DB, {
    userId: currentUser.id,
    householdId: query.household_id,
    period: query.period,
    periodStart: periodRange.start,
    periodEnd: periodRange.end,
  })
}
