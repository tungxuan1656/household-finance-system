import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { parsedExpenseItemSchema } from '@/contracts/expense-parse-schemas'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { createDraftFromPreview } from '@/db/repositories/telegram-bot-expense-draft-repository'
import { AiUpstreamError, parseExpensesWithAi } from '@/lib/ai/expense-parser'
import { getMinorUnits } from '@/lib/currency'

import { renderExpensePreviewText } from '../renderers/finance-text'
import {
  expenseCreatedKeyboard,
  expensePreviewKeyboard,
  openAppKeyboard,
} from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

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
 * Handle /ai <text> command.
 *
 * Parses via AI, shows structured preview with confirm buttons.
 * Unlinked users get Open App guidance.
 */
export const handleAiExpenseCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập và sử dụng tính năng này.\n\n' +
        '🏠 <a href="' +
        ctx.telegramBotTmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(ctx.telegramBotTmaUrl),
    }
  }

  // Extract text after /ai command
  const parts = ctx.text.split(/\s+/)
  const scopeToken = parts[1] ?? ''
  const hasScopeArg = scopeToken.startsWith('hh:') || scopeToken === 'household'
  const expenseText =
    parts.length > 1
      ? parts
          .slice(hasScopeArg ? 2 : 1)
          .join(' ')
          .trim()
      : ''

  if (!expenseText) {
    return {
      text:
        'Vui lòng nhập nội dung chi tiêu.\n\n' +
        'Ví dụ: <code>/ai ăn bún 30k 15/6</code>',
      parseMode: 'HTML',
    }
  }

  // Read AI config from environment (passed through ctx.env from service deps)
  if (
    !ctx.env?.OPENAI_COMPAT_BASE_URL ||
    !ctx.env?.OPENAI_COMPAT_API_KEY ||
    !ctx.env?.OPENAI_COMPAT_MODEL
  ) {
    return {
      text: 'Rất tiếc, tính năng AI chưa được cấu hình. Vui lòng thử lại sau.',
      parseMode: 'HTML',
    }
  }

  // Call AI parser
  let rawItems: Array<{
    amount: number
    categoryKey: string
    sourceKey?: string
    title: string
    occurredAt?: string
  }>

  try {
    rawItems = await parseExpensesWithAi(
      expenseText,
      {
        baseUrl: ctx.env.OPENAI_COMPAT_BASE_URL!,
        apiKey: ctx.env.OPENAI_COMPAT_API_KEY!,
        model: ctx.env.OPENAI_COMPAT_MODEL!,
      },
      { defaultOccurredAt: new Date().toISOString().slice(0, 10) },
    )
  } catch (error) {
    if (error instanceof AiUpstreamError) {
      return {
        text: 'Rất tiếc, dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
        parseMode: 'HTML',
      }
    }
    throw error
  }

  if (rawItems.length === 0) {
    return {
      text:
        'Không thể nhận diện chi tiêu từ tin nhắn của bạn. Vui lòng thử lại với cách viết khác.\n\n' +
        'Ví dụ: <code>/ai ăn bún 30k 15/6</code>',
      parseMode: 'HTML',
    }
  }

  // Use only the first complete item (multi-expense not supported)
  const defaultDate = new Date().toISOString().slice(0, 10)
  let validItem: ParsedExpenseItem | null = null

  for (const raw of rawItems) {
    validItem = normalizeAiItem(raw, defaultDate)
    if (validItem) break
  }

  if (!validItem) {
    return {
      text:
        'Thiếu thông tin bắt buộc (số tiền, danh mục, ngày, nội dung). Vui lòng thử lại.\n\n' +
        'Ví dụ: <code>/ai ăn bún 30k 15/6</code>',
      parseMode: 'HTML',
    }
  }

  // If there were extra items, note that only the first was used
  const extraNote =
    rawItems.length > 1
      ? '\n\nℹ️ Chỉ xử lý khoản chi tiêu đầu tiên. Các khoản còn lại đã được bỏ qua.'
      : ''

  // Default scope: personal
  let scope: 'personal' | 'household' = 'personal'
  let householdId: string | undefined
  let householdName: string | undefined
  const db = ctx.db

  if (hasScopeArg) {
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

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
        }
      }
    }
  }

  // Determine currency from household or default VND
  const currencyCode =
    scope === 'household' && householdId
      ? ((await findHouseholdById(db, householdId))?.defaultCurrencyCode ??
        'VND')
      : 'VND'

  const preview = {
    amountMinor: getMinorUnits(validItem.amount, currencyCode),
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
    ctx.appUserId,
    expenseText,
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
  // Surface the same confirmation message the confirm handler shows on a
  // repeat tap, instead of a confusing preview that would otherwise re-arm
  // the confirmed state if confirmed by accident.
  if (draft.status === 'confirmed' && draft.createdExpenseId) {
    return {
      text:
        '✅ Chi tiêu này đã được thêm trước đó.\n\n' +
        `Mã giao dịch: <code>${draft.createdExpenseId}</code>`,
      parseMode: 'HTML',
      replyMarkup: expenseCreatedKeyboard(ctx.telegramBotTmaUrl),
    }
  }

  return {
    text: renderExpensePreviewText(preview, currencyCode) + extraNote,
    parseMode: 'HTML',
    replyMarkup: expensePreviewKeyboard(draft.id),
  }
}

/**
 * Compute a dedupe key: SHA-256 of (telegramUserId + "|" + rawText + "|" + occurredAt).
 */
const computeDedupeKey = async (
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
