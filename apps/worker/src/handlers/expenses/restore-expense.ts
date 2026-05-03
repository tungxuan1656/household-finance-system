import type { Context } from 'hono'

import type { RestoreExpenseResponse } from '@/contracts'
import { expensePathParamsSchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findExpenseByIdIncludingDeleted,
  restoreExpense,
  softDeleteExpense,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { canEditAnyExpense } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

import { mapStoredExpenseToDto } from './shared'

type RestoreExpenseHandlerCtx = Context<AppBindings>

export const restoreExpenseHandler = async (
  ctx: RestoreExpenseHandlerCtx,
): Promise<RestoreExpenseResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const parsedParams = expensePathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })
  if (!parsedParams.success) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const expense = await findExpenseByIdIncludingDeleted(
    db,
    parsedParams.data.id,
  )
  if (!expense || !expense.deletedAt || !expense.householdId) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    expense.householdId,
  )

  if (!membership || !canEditAnyExpense(membership.role)) {
    throw forbidden(locale, 'expenses.expenseForbidden')
  }

  const restoredExpense = await restoreExpense(db, expense.id)
  if (!restoredExpense) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  try {
    await createAuditLogEntry(db, {
      householdId: expense.householdId,
      actorUserId: currentUser.id,
      actionType: 'expense.restored',
      targetType: 'expense',
      targetId: expense.id,
      payloadJson: JSON.stringify({
        restoredDeletedAt: expense.deletedAt,
        visibility: expense.visibility,
      }),
    })
  } catch (error) {
    await softDeleteExpense(db, expense.id)

    throw error
  }

  return mapStoredExpenseToDto(restoredExpense)
}
