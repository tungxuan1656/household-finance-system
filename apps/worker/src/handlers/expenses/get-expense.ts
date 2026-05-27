import type { Context } from 'hono'

import type { ExpenseDTO } from '@/contracts'
import {
  expensePathParamsSchema,
  REFERENCE_CATEGORY_KEYS,
  REFERENCE_SOURCE_KEYS,
} from '@/contracts'
import { findGroupIdsForExpense } from '@/db/repositories/expense-group-repository'
import { findExpenseByIdRaw } from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

const CATEGORY_KEYS = new Set<string>(REFERENCE_CATEGORY_KEYS)
const SOURCE_KEYS = new Set<string>(REFERENCE_SOURCE_KEYS)

type GetExpenseHandlerCtx = Context<AppBindings>

export const getExpenseHandler = async (
  ctx: GetExpenseHandlerCtx,
): Promise<ExpenseDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Parse path params
  const parsed = expensePathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })

  if (!parsed.success) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const { id } = parsed.data

  // Fetch expense and enforce V2 access based on household attachment.
  const expense = await findExpenseByIdRaw(db, id)

  if (!expense) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  if (!expense.householdId || expense.spentByUserId === currentUser.id) {
    if (expense.spentByUserId !== currentUser.id) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  } else {
    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      expense.householdId,
    )

    if (!membership) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  }

  // Fetch group assignments
  const groupIds = await findGroupIdsForExpense(db, expense.id)

  // Map to DTO
  const dto: ExpenseDTO = {
    id: expense.id,
    title: expense.title,
    amountMinor: expense.amountMinor,
    currencyCode: expense.currencyCode,
    categoryKey: CATEGORY_KEYS.has(expense.categoryKey)
      ? (expense.categoryKey as ExpenseDTO['categoryKey'])
      : 'other',
    sourceKey: SOURCE_KEYS.has(expense.sourceKey)
      ? (expense.sourceKey as ExpenseDTO['sourceKey'])
      : 'cash',
    occurredAt: expense.occurredAt,
    householdId: expense.householdId,
    spentByUserId: expense.spentByUserId,
    note: expense.note,
    groupIds,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }

  return dto
}
