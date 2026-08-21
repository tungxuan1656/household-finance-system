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
import {
  listExpenseGroupsByHouseholdIds,
  listExpenseGroupsByOwner,
} from '@/db/repositories/expense-group-repository'
import { listUserHouseholds } from '@/db/repositories/household-repository'
import type { RawAiItem } from '@/lib/ai/expense-parser'
import { AI_CONTEXT_MAX_ITEMS } from '@/lib/ai/expense-parser'
import { AiUpstreamError } from '@/lib/ai/expense-parser'
import { parseExpensesWithAi } from '@/lib/ai/expense-parser'
import { badGateway, internalError } from '@/lib/errors'
import { logger, truncateErrorMessage } from '@/lib/logger'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

const YYYY_MM_DD_RE = /^\d{4}-\d{2}-\d{2}$/

export const normalizeNameKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    // 'đ' (U+0111) does not decompose under NFD, so replace manually; after toLowerCase only 'đ' remains (not 'Đ')
    .replaceAll('đ', 'd')

const warnContextFetchFailed = (
  error: unknown,
  requestId: string | undefined,
): void => {
  logger.warn(requestId, 'parse_expense_context_fetch_failed', {
    errorName: error instanceof Error ? error.name : 'UnknownError',
    errorMessage:
      error instanceof Error
        ? truncateErrorMessage(error.message)
        : truncateErrorMessage(String(error)),
  })
}

export const fetchAiContext = async (
  db: D1Database,
  userId: string,
  requestId: string | undefined,
): Promise<{
  availableHouseholds: { id: string; name: string }[]
  availableGroups: { id: string; name: string; householdId: string | null }[]
  householdNameToId: Map<string, string>
  groupNameToId: Map<string, string>
}> => {
  let availableHouseholds: { id: string; name: string }[] = []
  let availableGroups: {
    id: string
    name: string
    householdId: string | null
  }[] = []
  const householdNameToId = new Map<string, string>()
  const groupNameToId = new Map<string, string>()

  try {
    const [households, personalGroups] = await Promise.all([
      listUserHouseholds(db, userId).catch((error: unknown) => {
        warnContextFetchFailed(error, requestId)

        return []
      }),
      listExpenseGroupsByOwner(db, userId).catch((error: unknown) => {
        warnContextFetchFailed(error, requestId)

        return []
      }),
    ])

    let householdGroups: typeof personalGroups = []
    if (households.length > 0) {
      try {
        const householdIds = households.map((h) => h.id)

        householdGroups = await listExpenseGroupsByHouseholdIds(
          db,
          householdIds,
        )
      } catch (error: unknown) {
        warnContextFetchFailed(error, requestId)

        householdGroups = []
      }
    }

    const allGroups = [...householdGroups, ...personalGroups]

    // Cap 15 each, most recent first. Households are ASC so sort desc; groups need global recency sort.
    const sortedHouseholds = [...households].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    )

    availableHouseholds = sortedHouseholds
      .slice(0, AI_CONTEXT_MAX_ITEMS)
      .map((h) => ({ id: h.id, name: h.name }))

    const sortedGroups = [...allGroups].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    )

    availableGroups = sortedGroups
      .slice(0, AI_CONTEXT_MAX_ITEMS)
      .map((g) => ({ id: g.id, name: g.name, householdId: g.householdId }))

    for (const h of availableHouseholds) {
      const rawKey = h.name.trim().toLowerCase()
      const normKey = normalizeNameKey(h.name)
      if (!householdNameToId.has(rawKey)) householdNameToId.set(rawKey, h.id)
      if (!householdNameToId.has(normKey)) {
        householdNameToId.set(normKey, h.id)
      } else if (householdNameToId.get(normKey) !== h.id) {
        logger.warn(requestId, 'parse_expense_name_collision', {
          normalizedKey: normKey,
          keptId: householdNameToId.get(normKey),
          droppedName: h.name,
        })
      }
    }
    for (const g of availableGroups) {
      const rawKey = g.name.trim().toLowerCase()
      const normKey = normalizeNameKey(g.name)
      if (!groupNameToId.has(rawKey)) groupNameToId.set(rawKey, g.id)
      if (!groupNameToId.has(normKey)) {
        groupNameToId.set(normKey, g.id)
      } else if (groupNameToId.get(normKey) !== g.id) {
        logger.warn(requestId, 'parse_expense_name_collision', {
          normalizedKey: normKey,
          keptId: groupNameToId.get(normKey),
          droppedName: g.name,
        })
      }
    }
  } catch (error: unknown) {
    warnContextFetchFailed(error, requestId)

    availableHouseholds = []
    availableGroups = []
  }

  return {
    availableHouseholds,
    availableGroups,
    householdNameToId,
    groupNameToId,
  }
}

export const mapAiNamesToIds = (
  rawItem: RawAiItem,
  maps: {
    householdNameToId: Map<string, string>
    groupNameToId: Map<string, string>
  },
  counters?: { mappedHouseholdCount: number; mappedGroupCount: number },
): { householdId: string | null; groupIds: string[] } => {
  let householdId: string | null = null
  const rawHouseholdName =
    typeof rawItem.householdName === 'string'
      ? rawItem.householdName.trim()
      : null
  if (rawHouseholdName) {
    const rawKey = rawHouseholdName.toLowerCase()
    const normKey = normalizeNameKey(rawHouseholdName)
    const mapped =
      maps.householdNameToId.get(rawKey) ??
      maps.householdNameToId.get(normKey) ??
      null
    householdId = mapped
    if (mapped && counters) counters.mappedHouseholdCount++
  }

  const rawGroupNames = Array.isArray(rawItem.groupNames)
    ? rawItem.groupNames
    : []
  const groupIdSet = new Set<string>()
  for (const gName of rawGroupNames) {
    if (typeof gName !== 'string') continue

    const trimmed = gName.trim()
    if (!trimmed) continue

    const rawKey = trimmed.toLowerCase()
    const normKey = normalizeNameKey(trimmed)
    const gid =
      maps.groupNameToId.get(rawKey) ?? maps.groupNameToId.get(normKey) ?? null
    if (gid) {
      groupIdSet.add(gid)
    }
  }

  const groupIds = Array.from(groupIdSet)
  if (groupIds.length > 0 && counters)
    counters.mappedGroupCount += groupIds.length

  return { householdId, groupIds }
}

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
        { householdNameToId, groupNameToId },
        mutableCounters,
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
