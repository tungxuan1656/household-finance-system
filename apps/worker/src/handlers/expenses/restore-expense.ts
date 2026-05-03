import type { Context } from 'hono'

import type { RestoreExpenseResponse } from '@/contracts'
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
  authorizeAdminForHouseholdExpense,
  authorizeExpenseAccess,
} from './expense-authorization'
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

  const expense = await authorizeExpenseAccess(
    db,
    parsedParams.data.id,
    currentUser.id,
    locale,
    { includeDeleted: true },
  )

  if (!expense.deletedAt || !expense.householdId) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  await authorizeAdminForHouseholdExpense(db, expense, currentUser.id, locale)

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
