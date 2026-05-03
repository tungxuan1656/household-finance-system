import type { Context } from 'hono'

import type { ExpenseListResponse } from '@/contracts'
import { deletedExpenseListQuerySchema } from '@/contracts'
import { listDeletedExpensesByHousehold } from '@/db/repositories/expense-query-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { canEditAnyExpense } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

import { mapStoredExpenseToDto } from './shared'

type ListDeletedExpensesHandlerCtx = Context<AppBindings>

export const listDeletedExpensesHandler = async (
  ctx: ListDeletedExpensesHandlerCtx,
): Promise<ExpenseListResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const parsed = deletedExpenseListQuerySchema().safeParse(ctx.req.query())
  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    parsed.data.household_id,
  )

  if (!membership || !canEditAnyExpense(membership.role)) {
    throw forbidden(locale, 'expenses.expenseForbidden')
  }

  const items = await listDeletedExpensesByHousehold(
    db,
    parsed.data.household_id,
  )

  return {
    items: items.map(mapStoredExpenseToDto),
    nextCursor: null,
  }
}
