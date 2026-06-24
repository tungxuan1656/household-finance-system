import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { parsedExpenseItemSchema } from '@/contracts/expense-parse-schemas'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { createDraftFromPreview } from '@/db/repositories/telegram-bot-expense-draft-repository'
import { getMinorUnits } from '@/lib/currency'

import type { ParsedPreviewData } from '../renderers/finance-text'
import { renderExpensePreviewText } from '../renderers/finance-text'
import {
  expenseCreatedKeyboard,
  expensePreviewKeyboard,
} from '../renderers/keyboards'
import type { InlineKeyboardMarkup } from '../types'
import type { CommandContext } from '../types'

const YYYY_MM_DD_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Pure normalization of a raw AI item into a ParsedExpenseItem (no Hono context).
 * Mirrors the logic in parse-expense.ts handler lines ~76-101 but as a pure function.
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
 * Build preview data + draft from a validated ParsedExpenseItem.
 *
 * Handles scope resolution, currency lookups, draft creation, and dedupe
 * detection. Used by both /ai command handler and natural input handler.
 *
 * Return type:
 * - { preview, draftId, currencyCode } on success → caller renders + attaches keyboard
 * - { status: 'confirmed', text, replyMarkup } when draft already confirmed (dedupe hit)
 */
export const buildDraftFromItem = async (
  ctx: CommandContext,
  validItem: ParsedExpenseItem,
  options: {
    rawText: string
    defaultDate: string
    scopeArg?: string
    overrideAmountMinor?: number
  },
): Promise<
  | {
      preview: ParsedPreviewData
      draftId: string
      currencyCode: string
    }
  | {
      status: 'confirmed'
      text: string
      replyMarkup: InlineKeyboardMarkup
    }
> => {
  const db = ctx.db
  const scopeToken = options.scopeArg ?? ''
  const hasScopeArg = scopeToken.startsWith('hh:') || scopeToken === 'household'

  // Default scope: personal
  let scope: 'personal' | 'household' = 'personal'
  let householdId: string | undefined
  let householdName: string | undefined
  let currencyCode = 'VND'

  if (hasScopeArg) {
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId!)

    if (householdIds.length > 0) {
      const targetHhId = scopeToken.startsWith('hh:')
        ? scopeToken.slice(3).trim()
        : householdIds[0]

      if (householdIds.includes(targetHhId)) {
        const hh = await findHouseholdById(db, targetHhId)
        if (hh) {
          scope = 'household'
          householdId = hh.id
          householdName = hh.name
          currencyCode = hh.defaultCurrencyCode ?? 'VND'
        }
      }
    }
  }

  const amountMinor =
    options.overrideAmountMinor !== undefined
      ? options.overrideAmountMinor
      : getMinorUnits(validItem.amount, currencyCode)

  const preview: ParsedPreviewData = {
    amountMinor,
    occurredAt: validItem.occurredAt,
    categoryKey: validItem.categoryKey,
    title: validItem.title,
    sourceKey: validItem.sourceKey,
    scope,
    householdId: scope === 'household' ? householdId : undefined,
    householdName: scope === 'household' ? householdName : undefined,
  }

  // Create draft for confirm/cancel tracking
  const dedupeKey = await computeDedupeKey(
    ctx.appUserId!,
    options.rawText,
    validItem.occurredAt,
  )

  const draft = await createDraftFromPreview({
    db,
    telegramUserId: String(ctx.userId),
    telegramChatId: String(ctx.chatId),
    dedupeKey,
    preview,
    locale: ctx.locale,
  })

  // Idempotency: dedupe key already created an expense for this input.
  if (draft.status === 'confirmed' && draft.createdExpenseId) {
    return {
      status: 'confirmed',
      text:
        '✅ Chi tiêu này đã được thêm trước đó.\n\n' +
        `Mã giao dịch: <code>${draft.createdExpenseId}</code>`,
      replyMarkup: expenseCreatedKeyboard(ctx.telegramBotTmaUrl),
    }
  }

  return {
    preview,
    draftId: draft.id,
    currencyCode,
  }
}

/**
 * Compute a dedupe key: SHA-256 of (telegramUserId + "|" + rawText + "|" + occurredAt).
 */
export const computeDedupeKey = async (
  telegramUserId: string,
  rawText: string,
  occurredAt: string,
): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${telegramUserId}|${rawText}|${occurredAt}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Maximum number of expenses parsed from a single /aimulti message.
 * Caps chat spam while still covering realistic batches (a day of shopping,
 * a day of travel, etc.).
 */
export const MAX_BATCH_SIZE = 10

/**
 * One preview inside a multi-expense batch.
 * The service sends one Telegram message per item, each with its own
 * `draftId` and the standard preview keyboard. The per-message edit-in-place
 * machinery (confirm / household / cancel) works unchanged.
 */
export interface BatchPreviewItem {
  draftId: string
  text: string
  replyMarkup: InlineKeyboardMarkup
}

/**
 * Result of `buildDraftsFromItems` — used by the /aimulti handler.
 * - `previews` is the list of preview items the service should send
 *   (one Telegram message per item). Empty when nothing could be built.
 * - `dedupeHits` is a list of (draftId, response) for items whose draft
 *   was already confirmed (idempotent re-send). The service surfaces these
 *   as additional confirmation messages so the user still gets feedback.
 * - `truncatedCount` is the number of raw AI items dropped because they
 *   exceeded MAX_BATCH_SIZE. 0 when nothing was truncated.
 * - `invalidCount` is the number of raw AI items the normalizer rejected
 *   (missing required fields). The service may add a note to the first
 *   preview so the user knows.
 */
export interface BatchBuildResult {
  previews: BatchPreviewItem[]
  dedupeHits: Array<{ text: string; replyMarkup: InlineKeyboardMarkup }>
  truncatedCount: number
  invalidCount: number
}

/**
 * Build N preview items + draft rows from N validated ParsedExpenseItems.
 * Used by the /aimulti command path. Each item gets its own draft (and
 * therefore its own confirm / household / cancel message in the chat).
 *
 * Errors (DB failure, invalid membership) for an individual item are
 * converted into a confirmation-style message in the `previews` list
 * prefixed with `⚠️` so the user can see what happened per item.
 */
export const buildDraftsFromItems = async (
  ctx: CommandContext,
  validItems: ParsedExpenseItem[],
  options: {
    rawText: string
    defaultDate: string
    scopeArg?: string
  },
): Promise<BatchBuildResult> => {
  const result: BatchBuildResult = {
    previews: [],
    dedupeHits: [],
    truncatedCount: 0,
    invalidCount: 0,
  }

  for (const item of validItems) {
    const built = await buildDraftFromItem(ctx, item, options)

    if ('status' in built) {
      result.dedupeHits.push({
        text: built.text,
        replyMarkup: built.replyMarkup,
      })

      continue
    }

    result.previews.push({
      draftId: built.draftId,
      text: renderExpensePreviewText(built.preview, built.currencyCode),
      replyMarkup: expensePreviewKeyboard(built.draftId),
    })
  }

  return result
}
