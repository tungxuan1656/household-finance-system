import type { Context } from 'hono'

import type { ExpenseGroupDTO, UpdateExpenseGroupRequest } from '@/contracts'
import {
  expenseGroupPathParamsSchema,
  updateExpenseGroupRequestSchema,
} from '@/contracts'
import {
  findExpenseGroupById,
  updateExpenseGroup as updateExpenseGroupRepo,
} from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import { canManageGroups } from '@/lib/permissions/household-policy'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

type UpdateExpenseGroupHandlerCtx = Context<AppBindings>

export const updateExpenseGroupHandler = async (
  ctx: UpdateExpenseGroupHandlerCtx,
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

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    group.householdId ?? '',
  )
  if (!membership && group.createdByUserId !== currentUser.id) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  if (membership && !canManageGroups(membership.role)) {
    throw forbidden(locale, 'errors.forbidden')
  }

  const body = await readJsonBody<UpdateExpenseGroupRequest>(
    ctx.req.raw,
    updateExpenseGroupRequestSchema(),
    locale,
  )

  const updated = await updateExpenseGroupRepo(db, params.data.id, {
    name: body.name,
    description: body.description !== undefined ? body.description : undefined,
    startDate: body.startDate !== undefined ? body.startDate : undefined,
    endDate: body.endDate !== undefined ? body.endDate : undefined,
    eventBudgetMinor:
      body.eventBudget !== undefined ? body.eventBudget : undefined,
  })

  if (!updated) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const refreshed = await findExpenseGroupById(db, params.data.id)
  if (!refreshed) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return {
    id: refreshed.id,
    name: refreshed.name,
    description: refreshed.description,
    status: refreshed.status,
    startDate: refreshed.startDate,
    endDate: refreshed.endDate,
    eventBudgetMinor: refreshed.eventBudgetMinor,
    totalSpendMinor: refreshed.totalSpendMinor,
    householdId: refreshed.householdId,
    createdByUserId: refreshed.createdByUserId,
    createdAt: refreshed.createdAt,
    updatedAt: refreshed.updatedAt,
  }
}
