import type { Context } from 'hono'

import type {
  IncomeDTO,
  IncomeListQuery,
  IncomeListResponse,
} from '@/contracts'
import { incomeListQuerySchema } from '@/contracts'
import {
  decodeIncomeCursor,
  listIncomes,
} from '@/db/repositories/income-repository'
import { invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type ListIncomesHandlerCtx = Context<AppBindings>

export const listIncomesHandler = async (
  ctx: ListIncomesHandlerCtx,
): Promise<IncomeListResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Parse and validate query params
  const parsed = incomeListQuerySchema().safeParse(ctx.req.query())

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

  const query: IncomeListQuery = parsed.data

  // Validate cursor format if provided — return 400 for invalid cursors
  if (query.cursor) {
    const decoded = decodeIncomeCursor(query.cursor)

    if (!decoded) {
      throw invalidInput(locale, 'errors.invalidRequestBody', [
        { path: 'cursor', message: 'Invalid cursor format' },
      ])
    }
  }

  // Build repository input from validated query
  const result = await listIncomes(db, {
    userId: currentUser.id,
    cursor: query.cursor,
    limit: query.limit,
    dateFrom: query.date_from,
    dateTo: query.date_to,
    sourceKey: query.source_key,
  })

  // Map stored incomes to DTOs
  const items: IncomeDTO[] = result.items.map((income) => ({
    id: income.id,
    spentByUserId: income.spentByUserId,
    amountMinor: income.amountMinor,
    currencyCode: income.currencyCode,
    categoryKey: 'money-in',
    sourceKey: income.sourceKey as IncomeDTO['sourceKey'],
    occurredAt: income.occurredAt,
    title: income.title,
    note: income.note,
    createdAt: income.createdAt,
    updatedAt: income.updatedAt,
  }))

  return {
    items,
    nextCursor: result.nextCursor,
  }
}
