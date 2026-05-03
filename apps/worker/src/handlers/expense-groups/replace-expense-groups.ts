import type { Context } from 'hono'

import type { ExpenseDTO, ReplaceExpenseGroupsRequest } from '@/contracts'
import {
  expensePathParamsSchema,
  replaceExpenseGroupsRequestSchema,
} from '@/contracts'
import {
  findExpenseGroupById,
  replaceExpenseGroupAssignments,
} from '@/db/repositories/expense-group-repository'
import { findExpenseByIdRaw } from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { conflict, forbidden, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import {
  canEditAnyExpense,
  canEditOwnExpense,
} from '@/lib/permissions/household-policy'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

import { mapStoredExpenseToDto } from '../expenses/shared'

type ReplaceExpenseGroupsHandlerCtx = Context<AppBindings>

export const replaceExpenseGroupsHandler = async (
  ctx: ReplaceExpenseGroupsHandlerCtx,
): Promise<ExpenseDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Parse path params
  const parsedParams = expensePathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })
  if (!parsedParams.success) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const expenseId = parsedParams.data.id

  // Read and validate request body
  const body = await readJsonBody<ReplaceExpenseGroupsRequest>(
    ctx.req.raw,
    replaceExpenseGroupsRequestSchema(),
    locale,
  )

  // Fetch expense
  const expense = await findExpenseByIdRaw(db, expenseId)
  if (!expense) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  // Authorization
  if (expense.visibility === 'private') {
    if (expense.createdByUserId !== currentUser.id) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  } else {
    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      expense.householdId!,
    )
    if (!membership) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }

    const canEdit =
      (expense.createdByUserId === currentUser.id &&
        canEditOwnExpense(membership.role)) ||
      canEditAnyExpense(membership.role)

    if (!canEdit) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  }

  // Validate all groups belong to the same household as the expense
  if (body.groupIds.length > 0) {
    if (!expense.householdId) {
      throw conflict(locale, 'expenses.cannotAssignGroupToPrivateExpense')
    }

    for (const groupId of body.groupIds) {
      const group = await findExpenseGroupById(db, groupId)
      if (!group) {
        throw notFound(locale, 'errors.resourceNotFound')
      }
      if (group.householdId !== expense.householdId) {
        throw conflict(locale, 'errors.conflict')
      }
    }

    await replaceExpenseGroupAssignments(
      db,
      expenseId,
      expense.householdId,
      body.groupIds,
    )
  } else {
    // Clear all assignments
    if (expense.householdId) {
      await replaceExpenseGroupAssignments(
        db,
        expenseId,
        expense.householdId,
        [],
      )
    }
  }

  return mapStoredExpenseToDto(expense, body.groupIds)
}
