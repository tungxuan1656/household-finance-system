import type { Context } from 'hono'

import type { GroupSummaryDTO } from '@/contracts'
import { expenseGroupPathParamsSchema } from '@/contracts'
import {
  findExpenseGroupById,
  getGroupSummary,
} from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type GetGroupSummaryHandlerCtx = Context<AppBindings>

export const getGroupSummaryHandler = async (
  ctx: GetGroupSummaryHandlerCtx,
): Promise<GroupSummaryDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const params = expenseGroupPathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const group = await findExpenseGroupById(db, params.data.id)
  if (!group) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    group.householdId ?? '',
  )
  if (!membership && group.createdByUserId !== currentUser.id) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const summary = await getGroupSummary(db, group.id, group.eventBudgetMinor)

  return {
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      status: group.status,
      startDate: group.startDate,
      endDate: group.endDate,
      eventBudgetMinor: group.eventBudgetMinor,
      totalSpendMinor: summary.totalSpendMinor,
      householdId: group.householdId,
      createdByUserId: group.createdByUserId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    },
    totalSpendMinor: summary.totalSpendMinor,
    expenseCount: summary.expenseCount,
    budgetRemainingMinor: summary.budgetRemainingMinor,
    memberContributions: summary.memberContributions,
  }
}
