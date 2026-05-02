import type { Context } from 'hono'

import type { ExpenseDTO } from '@/contracts'
import {
  expensePathParamsSchema,
  REFERENCE_CATEGORY_KEYS,
  REFERENCE_SOURCE_KEYS,
} from '@/contracts'
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

  // Fetch expense without visibility check (handler enforces visibility)
  const expense = await findExpenseByIdRaw(db, id)

  if (!expense) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  // Visibility enforcement:
  // - Private: only the creator can see it
  // - Household: only members of that household can see it
  if (expense.visibility === 'private') {
    if (expense.createdByUserId !== currentUser.id) {
      throw forbidden(locale, 'errors.forbidden')
    }
  } else if (expense.visibility === 'household') {
    if (expense.createdByUserId !== currentUser.id) {
      // Not the creator — check household membership
      if (expense.householdId) {
        const membership = await findActiveHouseholdMembership(
          db,
          currentUser.id,
          expense.householdId,
        )

        if (!membership) {
          throw forbidden(locale, 'errors.forbidden')
        }
      } else {
        // Household expense without household_id should not happen,
        // but treat as forbidden if not the creator
        throw forbidden(locale, 'errors.forbidden')
      }
    }
  }

  // Map to DTO
  const dto: ExpenseDTO = {
    id: expense.id,
    title: expense.title,
    amountMinor: expense.amountMinor,
    categoryKey: CATEGORY_KEYS.has(expense.categoryKey)
      ? (expense.categoryKey as ExpenseDTO['categoryKey'])
      : 'other',
    sourceKey: SOURCE_KEYS.has(expense.sourceKey)
      ? (expense.sourceKey as ExpenseDTO['sourceKey'])
      : 'cash',
    occurredAt: expense.occurredAt,
    visibility: expense.visibility,
    householdId: expense.householdId,
    payerUserId: expense.payerUserId,
    note: expense.note,
    createdByUserId: expense.createdByUserId,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }

  return dto
}
