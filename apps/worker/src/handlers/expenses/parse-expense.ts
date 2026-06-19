import type { Context } from 'hono'

import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import {
  parsedExpenseItemSchema,
  parseExpensesRequestSchema,
} from '@/contracts/expense-parse-schemas'
import type { RawAiItem } from '@/lib/ai/expense-parser'
import { parseExpensesWithAi } from '@/lib/ai/expense-parser'
import { internalError } from '@/lib/errors'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

const YYYY_MM_DD_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * POST /api/v1/expenses/parse
 *
 * Authenticated, read-only endpoint. Calls the OpenAI-compatible parser,
 * normalises AI output by applying defaults, validates every candidate
 * with {@link parsedExpenseItemSchema.safeParse}, and drops items that
 * fail.  NEVER writes to D1.
 */
export const parseExpenseHandler = async (
  ctx: Context<AppBindings>,
): Promise<{ expenses: ParsedExpenseItem[] }> => {
  const locale = ctx.get('locale')

  // 1. Validate request body (text + defaultOccurredAt)
  const body = await readJsonBody(
    ctx.req.raw,
    parseExpensesRequestSchema(),
    locale,
  )

  // 2. Read AI config from environment — fail fast if missing
  const baseUrl = ctx.env.OPENAI_COMPAT_BASE_URL
  const apiKey = ctx.env.OPENAI_COMPAT_API_KEY
  const model = ctx.env.OPENAI_COMPAT_MODEL

  if (!baseUrl || !apiKey || !model) {
    throw internalError(locale, 'errors.workerConfigurationInvalid')
  }

  // 3. Call AI parser (fetch with timeout, no raw-text logging)
  const rawItems = await parseExpensesWithAi(body.text, {
    baseUrl,
    apiKey,
    model,
  })

  // 4. Normalise defaults and validate each item via the schema.
  //    The schema enforces expense-kind category, source-key enum,
  //    title length, and YYYY-MM-DD occurredAt — any failure drops the item.
  const expenses: ParsedExpenseItem[] = rawItems.reduce<ParsedExpenseItem[]>(
    (acc, item: RawAiItem) => {
      const candidate = {
        amount: item.amount,
        categoryKey: item.categoryKey,
        sourceKey: item.sourceKey ?? ('bank-transfer' as const),
        title: item.title.trim(),
        occurredAt:
          typeof item.occurredAt === 'string' &&
          YYYY_MM_DD_RE.test(item.occurredAt)
            ? item.occurredAt
            : body.defaultOccurredAt,
      }

      const result = parsedExpenseItemSchema.safeParse(candidate)

      if (result.success) {
        acc.push(result.data)
      }

      return acc
    },
    [],
  )

  return { expenses }
}
