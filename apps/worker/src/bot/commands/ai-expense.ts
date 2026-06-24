import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'

import { renderExpensePreviewText } from '../renderers/finance-text'
import { expensePreviewKeyboard } from '../renderers/keyboards'
import type { InlineKeyboardMarkup } from '../types'
import type { BotResponse, CommandContext } from '../types'
import { parseAiCommandInput } from './ai-expense-preflight'
import {
  type BatchPreviewItem,
  buildDraftFromItem,
  buildDraftsFromItems,
  MAX_BATCH_SIZE,
  normalizeAiItem,
} from './ai-expense-shared'

/**
 * Result returned by `handleAiMultiExpenseCommand`. The service uses the
 * `kind` field to decide whether to edit the loader into a single message
 * (kind: 'single') or to edit into the first preview and send one Telegram
 * message per remaining preview (kind: 'batch'). `truncatedNote` is appended
 * to the first preview text when the AI returned more than MAX_BATCH_SIZE
 * items so the user knows some expenses were dropped.
 *
 * When `dedupeHits` is non-empty, the service sends each as a standalone
 * confirmation message after the preview loop (or instead of it when all
 * items were already confirmed).
 */
export type MultiExpenseResult =
  | { kind: 'single'; response: BotResponse }
  | {
      kind: 'batch'
      previews: BatchPreviewItem[]
      dedupeHits: Array<{ text: string; replyMarkup: InlineKeyboardMarkup }>
      truncatedNote: string | null
    }

/**
 * Handle /ai <text> command.
 *
 * Single-expense path. Parses via AI, shows structured preview with
 * confirm buttons. Unlinked users get Open App guidance.
 * For batch input use /aimulti instead.
 */
export const handleAiExpenseCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  const pre = await parseAiCommandInput(ctx)

  if (pre.kind === 'response') {
    return pre.response
  }

  const { expenseText, hasScopeArg, scopeToken, defaultDate, rawItems } =
    pre.input

  if (rawItems.length === 0) {
    return {
      text:
        'Chưa nhận diện được chi tiêu. Thử cách viết khác.\n\n' +
        'Vd: <code>/ai ăn bún 30k 15/6</code>',
      parseMode: 'HTML',
    }
  }

  // Use only the first complete item (multi-expense not supported here)
  let validItem: ParsedExpenseItem | null = null

  for (const raw of rawItems) {
    validItem = normalizeAiItem(raw, defaultDate)
    if (validItem) break
  }

  if (!validItem) {
    return {
      text:
        'Thiếu thông tin (tiền, danh mục, ngày, nội dung). Thử lại.\n\n' +
        'Vd: <code>/ai ăn bún 30k 15/6</code>',
      parseMode: 'HTML',
    }
  }

  // If there were extra items, note that only the first was used
  const extraNote =
    rawItems.length > 1
      ? '\n\nℹ️ Chỉ xử lý khoản đầu. Nhiều khoản dùng <code>/aimulti</code>.'
      : ''

  const built = await buildDraftFromItem(ctx, validItem, {
    rawText: expenseText,
    defaultDate,
    scopeArg: hasScopeArg ? scopeToken : undefined,
  })

  if ('status' in built) {
    return {
      text: built.text,
      parseMode: 'HTML',
      replyMarkup: built.replyMarkup,
    }
  }

  return {
    text:
      renderExpensePreviewText(built.preview, built.currencyCode) + extraNote,
    parseMode: 'HTML',
    replyMarkup: expensePreviewKeyboard(built.draftId),
  }
}

/**
 * Handle /aimulti <text> command.
 *
 * Multi-expense batch path. Parses up to MAX_BATCH_SIZE expenses via AI and
 * returns one preview per item. The service sends one Telegram message per
 * preview (the loader is repurposed as the first preview, like /ai does).
 *
 * Each preview has its own `draftId` and the standard preview keyboard, so
 * confirm / household / cancel keep working via the per-message edit-in-place
 * machinery from feat-117/118.
 *
 * Returns:
 * - `{ kind: 'single', response }` when the user typed /aimulti but the AI
 *   only produced one valid item. The service edits the loader to that
 *   single preview (graceful degradation, no surprise).
 * - `{ kind: 'batch', previews, truncatedNote }` for 2+ valid items.
 *   `truncatedNote` is non-null when the AI returned more than
 *   MAX_BATCH_SIZE items; the service appends it to the first preview text.
 */
export const handleAiMultiExpenseCommand = async (
  ctx: CommandContext,
): Promise<MultiExpenseResult> => {
  const pre = await parseAiCommandInput(ctx)

  if (pre.kind === 'response') {
    return { kind: 'single', response: pre.response }
  }

  const { expenseText, hasScopeArg, scopeToken, defaultDate, rawItems } =
    pre.input

  if (rawItems.length === 0) {
    return {
      kind: 'single',
      response: {
        text:
          'Chưa nhận diện được chi tiêu. Thử cách viết khác.\n\n' +
          'Vd: <code>/aimulti ăn bún 30k, cà phê 25k</code>',
        parseMode: 'HTML',
      },
    }
  }

  // Cap at MAX_BATCH_SIZE before normalization so the note is accurate.
  const truncatedCount = Math.max(0, rawItems.length - MAX_BATCH_SIZE)
  const cappedRawItems =
    truncatedCount > 0 ? rawItems.slice(0, MAX_BATCH_SIZE) : rawItems

  // Normalize all items. Drop ones that fail validation (missing fields).
  const validItems: ParsedExpenseItem[] = []

  for (const raw of cappedRawItems) {
    const normalized = normalizeAiItem(raw, defaultDate)
    if (normalized) validItems.push(normalized)
  }

  if (validItems.length === 0) {
    return {
      kind: 'single',
      response: {
        text:
          'Thiếu thông tin (tiền, danh mục, ngày, nội dung) ở tất cả các khoản. Thử lại.\n\n' +
          'Vd: <code>/aimulti ăn bún 30k, cà phê 25k</code>',
        parseMode: 'HTML',
      },
    }
  }

  // Graceful degradation: if the AI only returned one valid item, fall
  // through to the single-expense response shape so the service uses the
  // existing /ai send path. Avoids sending "1 message" via the batch path.
  if (validItems.length === 1) {
    const single = validItems[0]!
    const built = await buildDraftFromItem(ctx, single, {
      rawText: expenseText,
      defaultDate,
      scopeArg: hasScopeArg ? scopeToken : undefined,
    })

    if ('status' in built) {
      return {
        kind: 'single',
        response: {
          text: built.text,
          parseMode: 'HTML',
          replyMarkup: built.replyMarkup,
        },
      }
    }

    return {
      kind: 'single',
      response: {
        text: renderExpensePreviewText(built.preview, built.currencyCode),
        parseMode: 'HTML',
        replyMarkup: expensePreviewKeyboard(built.draftId),
      },
    }
  }

  // Multi path: build all drafts.
  const built = await buildDraftsFromItems(ctx, validItems, {
    rawText: expenseText,
    defaultDate,
    scopeArg: hasScopeArg ? scopeToken : undefined,
  })

  // Append the truncation note (if any) — used in the first preview text
  // or appended to every dedupe hit (the user needs to see items were
  // dropped even when all parsed items are deduped).
  const truncatedNote =
    truncatedCount > 0
      ? `\n\nℹ️ Chỉ lấy ${MAX_BATCH_SIZE} khoản đầu, ${truncatedCount} khoản sau bỏ qua.`
      : null

  if (built.previews.length === 0 && built.dedupeHits.length > 0) {
    // All items were already confirmed — surface dedupe hits as a batch.
    return {
      kind: 'batch',
      previews: [],
      dedupeHits: built.dedupeHits,
      truncatedNote,
    }
  }

  if (built.previews.length === 0) {
    // Nothing built and no dedupe hits either (edge case).
    return {
      kind: 'single',
      response: {
        text: 'Các khoản này đã được thêm trước đó. Gửi chi tiêu mới để tiếp tục.',
        parseMode: 'HTML',
      },
    }
  }

  return {
    kind: 'batch',
    previews: built.previews,
    dedupeHits: built.dedupeHits,
    truncatedNote,
  }
}
