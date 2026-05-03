import type { Context } from 'hono'

import type { DeleteExpenseResponse } from '@/contracts'
import { expensePathParamsSchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  restoreExpense,
  softDeleteExpense,
} from '@/db/repositories/expense-repository'
import { notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

import {
  authorizeExpenseAccess,
  authorizeExpenseMutation,
} from './expense-authorization'

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

  const expense = await authorizeExpenseAccess(
    db,
    parsedParams.data.id,
    currentUser.id,
    locale,
  )

  await authorizeExpenseMutation(db, expense, currentUser.id, locale)

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
