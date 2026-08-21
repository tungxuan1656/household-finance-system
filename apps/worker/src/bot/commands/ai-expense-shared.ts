import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { parsedExpenseItemSchema } from '@/contracts/expense-parse-schemas'
import type { RawAiItem } from '@/lib/ai/expense-parser'
import { mapAiNamesToIds } from '@/lib/ai/household-context'

// Re-export draft/dedupe helpers for backwards compat — keep public API unchanged
export { computeDedupeKey } from './ai-dedupe'
export type { BatchBuildResult, BatchPreviewItem } from './ai-draft'
export {
  buildDraftFromItem,
  buildDraftsFromItems,
  MAX_BATCH_SIZE,
} from './ai-draft'

const YYYY_MM_DD_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Pure normalization of a raw AI item into a ParsedExpenseItem (no Hono context).
 * Mirrors the logic in parse-expense.ts handler but as a pure function.
 * Whitelist household/group mapping lives in handlers/expenses/parse-expense.ts
 * (fetchAiContext + mapAiNamesToIds) and is reused by bot preflight/natural flows.
 * This helper stays household-agnostic for backwards compat; use
 * normalizeAiItemWithContext when you need household/group mapping.
 */
export const normalizeAiItem = (
  item: {
    amount: number
    categoryKey: string
    sourceKey?: string
    title: string
    occurredAt?: string
  },
  defaultOccurredAt: string,
): ParsedExpenseItem | null => {
  const candidate = {
    amount: item.amount,
    categoryKey: item.categoryKey,
    sourceKey: item.sourceKey ?? ('bank-transfer' as const),
    title: item.title.trim(),
    occurredAt:
      typeof item.occurredAt === 'string' && YYYY_MM_DD_RE.test(item.occurredAt)
        ? item.occurredAt
        : defaultOccurredAt,
  }

  const result = parsedExpenseItemSchema.safeParse(candidate)

  return result.success ? result.data : null
}

/**
 * Normalize + whitelist-map a RawAiItem. Keeps normalizeAiItem backwards compat
 * but also returns householdId/groupIds via mapAiNamesToIds (NFD+đ, collision warn).
 * Caller can inject counters for count-only logging (mappedHouseholdCount/groupCount).
 */
export const normalizeAiItemWithContext = (
  item: RawAiItem,
  defaultOccurredAt: string,
  maps: {
    householdNameToId: Map<string, string>
    groupNameToId: Map<string, string>
    groupIdToHouseholdId: Map<string, string | null>
  },
  counters?: { mappedHouseholdCount: number; mappedGroupCount: number },
  options?: {
    requestId?: string
    filterGroupByHousehold?: boolean
    householdId?: string | null
  },
): {
  parsed: ParsedExpenseItem | null
  householdId: string | null
  groupIds: string[]
} => {
  const parsed = normalizeAiItem(item, defaultOccurredAt)
  const { householdId, groupIds } = mapAiNamesToIds(item, maps, counters, {
    requestId: options?.requestId,
    filterGroupByHousehold: options?.filterGroupByHousehold,
    householdId: options?.householdId,
  })

  return { parsed, householdId, groupIds }
}
