import type { Context } from 'hono'

import type { DeleteExpenseResponse } from '@/contracts'
import { expensePathParamsSchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findExpenseByIdRaw,
  restoreExpense,
  softDeleteExpense,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import {
  canEditAnyExpense,
  canEditOwnExpense,
} from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

type DeleteExpenseHandlerCtx = Context<AppBindings>

export const deleteExpenseHandler = async (
  ctx: DeleteExpenseHandlerCtx,
): Promise<DeleteExpenseResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const parsedParams = expensePathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })
  if (!parsedParams.success) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const expense = await findExpenseByIdRaw(db, parsedParams.data.id)
  if (!expense) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  if (expense.visibility === 'private') {
    if (expense.createdByUserId !== currentUser.id) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  } else {
    if (!expense.householdId) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }

    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      expense.householdId,
    )

    if (!membership) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }

    const canDelete =
      (expense.createdByUserId === currentUser.id &&
        canEditOwnExpense(membership.role)) ||
      canEditAnyExpense(membership.role)

    if (!canDelete) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  }

  const deleted = await softDeleteExpense(db, expense.id)
  if (!deleted) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  if (expense.householdId) {
    try {
      await createAuditLogEntry(db, {
        householdId: expense.householdId,
        actorUserId: currentUser.id,
        actionType: 'expense.deleted',
        targetType: 'expense',
        targetId: expense.id,
        payloadJson: JSON.stringify({
          title: expense.title,
          visibility: expense.visibility,
          amountMinor: expense.amountMinor,
        }),
      })
    } catch (error) {
      await restoreExpense(db, expense.id)

      throw error
    }
  }

  return { deleted: true }
}
