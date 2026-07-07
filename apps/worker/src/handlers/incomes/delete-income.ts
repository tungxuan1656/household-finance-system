import type { Context } from 'hono'

import type { DeleteIncomeResponse } from '@/contracts'
import { incomePathParamsSchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findIncomeByIdIncludingDeleted,
  restoreIncome,
  softDeleteIncome,
} from '@/db/repositories/income-repository'
import { forbidden, internalError, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type DeleteIncomeHandlerCtx = Context<AppBindings>

export const deleteIncomeHandler = async (
  ctx: DeleteIncomeHandlerCtx,
): Promise<DeleteIncomeResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const parsedParams = incomePathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })
  if (!parsedParams.success) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  // Fetch income including deleted rows so we can distinguish
  // "already deleted" (404) from "not found" (404).
  const income = await findIncomeByIdIncludingDeleted(db, parsedParams.data.id)

  if (!income) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  // Personal incomes are owner-scoped; only the spender may delete.
  if (income.spentByUserId !== currentUser.id) {
    throw forbidden(locale, 'errors.forbidden')
  }

  // Already soft-deleted → treat as not found
  if (income.deletedAt !== null) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const deleted = await softDeleteIncome(db, income.id)
  if (!deleted) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  try {
    await createAuditLogEntry(db, {
      householdId: null, // incomes are personal-only
      actorUserId: currentUser.id,
      actionType: 'income.deleted',
      targetType: 'income',
      targetId: income.id,
      payloadJson: JSON.stringify({
        title: income.title,
        amountMinor: income.amountMinor,
      }),
    })
  } catch (error) {
    const rollback = await restoreIncome(db, income.id)

    if (!rollback) {
      throw internalError(locale, 'errors.rollbackFailed')
    }

    throw error
  }

  return { deleted: true }
}
