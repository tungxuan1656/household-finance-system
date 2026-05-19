import type { Context } from 'hono'

import type { ExpenseGroupDTO } from '@/contracts'
import { expenseGroupPathParamsSchema } from '@/contracts'
import { findExpenseGroupById } from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type GetExpenseGroupHandlerCtx = Context<AppBindings>

export const getExpenseGroupHandler = async (
  ctx: GetExpenseGroupHandlerCtx,
): Promise<ExpenseGroupDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const groupId = ctx.req.param('id')

  const params = expenseGroupPathParamsSchema().safeParse({ id: groupId })
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

  const membership = group.householdId
    ? await findActiveHouseholdMembership(db, currentUser.id, group.householdId)
    : null

  if (!membership && group.createdByUserId !== currentUser.id) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    status: group.status,
    startDate: group.startDate,
    endDate: group.endDate,
    eventBudgetMinor: group.eventBudgetMinor,
    totalSpendMinor: group.totalSpendMinor,
    householdId: group.householdId,
    createdByUserId: group.createdByUserId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  }
}
