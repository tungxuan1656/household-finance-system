import type { Context } from 'hono'

import type {
  ParsedExpenseItem,
  ParseExpensesResponse,
} from '@/contracts/expense-parse-schemas'
import {
  parsedExpenseItemSchema,
  parseExpensesRequestSchema,
  parseExpensesResponseSchema,
} from '@/contracts/expense-parse-schemas'
import type { RawAiItem } from '@/lib/ai/expense-parser'
import { AiUpstreamError } from '@/lib/ai/expense-parser'
import { parseExpensesWithAi } from '@/lib/ai/expense-parser'
import { fetchAiContext, mapAiNamesToIds } from '@/lib/ai/household-context'
import { badGateway, internalError } from '@/lib/errors'
import { logger, truncateErrorMessage } from '@/lib/logger'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

export {
  fetchAiContext,
  mapAiNamesToIds,
  normalizeNameKey,
} from '@/lib/ai/household-context'
export { AI_CONTEXT_MAX_ITEMS } from '@/lib/ai/household-context'

const YYYY_MM_DD_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * POST /api/v1/expenses/parse
 *
 * Authenticated, read-only endpoint. Calls the OpenAI-compatible parser,
 * normalises AI output by applying defaults, validates every candidate
 * with {@link parsedExpenseItemSchema.safeParse}, and drops items that
 * fail.  NEVER writes to D1.
 *
 * Throws {@link AiUpstreamError} → 502 BAD_GATEWAY on upstream failures;
 * returns 200 with an (possibly empty) expenses array on success.
 */
export const parseExpenseHandler = async (
  ctx: Context<AppBindings>,
): Promise<ParseExpensesResponse> => {
  const locale = ctx.get('locale')
  const requestId = ctx.get('requestId')

  // 1. Validate request body (text + defaultOccurredAt)
  const body = await readJsonBody(
    ctx.req.raw,
    parseExpensesRequestSchema(),
    locale,
  )

  logger.info(requestId, 'parse_expense_start', {
    textChars: body.text.length,
    defaultOccurredAt: body.defaultOccurredAt,
  })

  // 2. Read AI config from environment — fail fast if missing
  const baseUrl = ctx.env.OPENAI_COMPAT_BASE_URL
  const apiKey = ctx.env.OPENAI_COMPAT_API_KEY
  const model = ctx.env.OPENAI_COMPAT_MODEL

  if (!baseUrl || !apiKey || !model) {
    throw internalError(locale, 'errors.workerConfigurationInvalid')
  }

  // 2b. Fetch available households/groups for AI context (capped 15 each)
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const {
    availableHouseholds,
    availableGroups,
    householdNameToId,
    groupNameToId,
    groupIdToHouseholdId,
  } = await fetchAiContext(db, currentUser.id, requestId)

  // 3. Call AI parser (fetch with timeout, no raw-text logging)
  let rawItems: RawAiItem[]
  try {
    rawItems = await parseExpensesWithAi(
      body.text,
      {
        baseUrl,
        apiKey,
        model,
      },
      {
        defaultOccurredAt: body.defaultOccurredAt,
        requestId,
        context: {
          households: availableHouseholds,
          groups: availableGroups,
        },
      },
    )
  } catch (error) {
    if (error instanceof AiUpstreamError) {
      logger.error(requestId, 'parse_expense_ai_upstream_failure', {
        textChars: body.text.length,
      })

      throw badGateway(locale, 'errors.aiUpstreamFailure')
    }

    logger.error(requestId, 'parse_expense_error', {
      textChars: body.text.length,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage:
        error instanceof Error
          ? truncateErrorMessage(error.message)
          : truncateErrorMessage(String(error)),
    })

    throw error
  }

  // 4. Normalise defaults and validate each item via the schema.
  //    The schema enforces expense-kind category, source-key enum,
  //    title length, and YYYY-MM-DD occurredAt — any failure drops the item.
  //    householdName/groupNames are mapped to householdId/groupIds via whitelist maps;
  //    hallucinated names are dropped (null/[]).
  //    Mirrors bot's normalizeAiItem for base fields (amount/category/source/title/occurredAt) — bot ignores household/group by design — parse-only.
  let droppedCount = 0
  const mutableCounters = {
    mappedHouseholdCount: 0,
    mappedGroupCount: 0,
  }
  const expenses: ParsedExpenseItem[] = rawItems.reduce<ParsedExpenseItem[]>(
    (acc, item: RawAiItem) => {
      const { householdId, groupIds } = mapAiNamesToIds(
        item,
        { householdNameToId, groupNameToId, groupIdToHouseholdId },
        mutableCounters,
        { requestId, filterGroupByHousehold: true },
      )

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
        householdId,
        // groupIds always [] not undefined is intentional; keep as []
        groupIds,
      }

      const result = parsedExpenseItemSchema.safeParse(candidate)

      if (result.success) {
        acc.push(result.data)
      } else {
        droppedCount++
      }

      return acc
    },
    [],
  )
  const mappedHouseholdCount = mutableCounters.mappedHouseholdCount
  const mappedGroupCount = mutableCounters.mappedGroupCount

  // 5. Build response and validate against the output schema (N5)
  const response: ParseExpensesResponse = {
    expenses,
    ...(droppedCount > 0 ? { droppedCount } : {}),
  }

  logger.info(requestId, 'parse_expense_success', {
    textChars: body.text.length,
    rawItemsCount: rawItems.length,
    expensesCount: expenses.length,
    droppedCount,
    householdCount: availableHouseholds.length,
    groupCount: availableGroups.length,
    mappedHouseholdCount,
    mappedGroupCount,
  })

  // Output validation — throws if response shape is ever invalid
  return parseExpensesResponseSchema.parse(response)
}
