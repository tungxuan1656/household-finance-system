import type { Context } from 'hono'

import type { AnalyticsGroupsDTO } from '@/contracts'
import { analyticsGroupsQuerySchema } from '@/contracts'
import { getAnalyticsGroups } from '@/db/repositories/expense-query-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

import { toPeriodRange } from './period'

type GetAnalyticsGroupsHandlerCtx = Context<AppBindings>

export const getAnalyticsGroupsHandler = async (
  ctx: GetAnalyticsGroupsHandlerCtx,
): Promise<AnalyticsGroupsDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const parsed = analyticsGroupsQuerySchema().safeParse(ctx.req.query())

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

  return getAnalyticsGroups(ctx.env.DB, {
    userId: currentUser.id,
    householdId: query.household_id,
    period: query.period,
    periodStart: periodRange.start,
    periodEnd: periodRange.end,
  })
}
