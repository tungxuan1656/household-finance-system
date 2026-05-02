import type { Context } from 'hono'

import type {
  ExpenseDTO,
  ExpenseListQuery,
  ExpenseListResponse,
} from '@/contracts'
import {
  expenseListQuerySchema,
  REFERENCE_CATEGORY_KEYS,
  REFERENCE_SOURCE_KEYS,
} from '@/contracts'
import { decodeCursor } from '@/db/repositories/expense-repository'
import { listExpenses } from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

const CATEGORY_KEYS = new Set<string>(REFERENCE_CATEGORY_KEYS)
const SOURCE_KEYS = new Set<string>(REFERENCE_SOURCE_KEYS)

type ListExpensesHandlerCtx = Context<AppBindings>

export const listExpensesHandler = async (
  ctx: ListExpensesHandlerCtx,
): Promise<ExpenseListResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Parse and validate query params
  const parsed = expenseListQuerySchema().safeParse(ctx.req.query())

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

  const query: ExpenseListQuery = parsed.data

  // Validate cursor format if provided — return 400 for invalid cursors
  if (query.cursor) {
    const decoded = decodeCursor(query.cursor)

    if (!decoded) {
      throw invalidInput(locale, 'errors.invalidRequestBody', [
        { path: 'cursor', message: 'Invalid cursor format' },
      ])
    }
  }

  // If household_id is provided, verify the user is an active member
  if (query.household_id) {
    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      query.household_id,
    )

    if (!membership) {
      throw forbidden(locale, 'errors.forbidden')
    }
  }

  // Build repository input from validated query
  const result = await listExpenses(db, {
    userId: currentUser.id,
    householdId: query.household_id,
    cursor: query.cursor,
    limit: query.limit,
    dateFrom: query.date_from,
    dateTo: query.date_to,
    categoryKey: query.category_key,
    payerId: query.payer_id,
    visibility: query.visibility,
  })

  // Map stored expenses to DTOs
  const items: ExpenseDTO[] = result.items.map((expense) => ({
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
  }))

  return {
    items,
    nextCursor: result.nextCursor,
  }
}
