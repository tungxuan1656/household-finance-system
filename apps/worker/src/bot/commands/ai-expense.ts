import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { findDraftById } from '@/db/repositories/telegram-bot-expense-draft-repository'
import { AiUpstreamError, parseExpensesWithAi } from '@/lib/ai/expense-parser'

import type { ParsedPreviewData } from '../renderers/finance-text'
import { renderExpensePreviewText } from '../renderers/finance-text'
import {
  expensePreviewFullKeyboard,
  openAppKeyboard,
} from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'
import { buildDraftFromItem, normalizeAiItem } from './ai-expense-shared'

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
    replyMarkup: expensePreviewFullKeyboard(built.draftId),
  }
}

/**
 * Handle the detail:draftId callback — show full preview
 * (with date, source, scope) instead of compact.
 */
export const handleDetailExpense = async (
  ctx: CommandContext,
  draftId: string,
  messageId: number,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập.\n\n' +
        '🏠 <a href="' +
        ctx.telegramBotTmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(ctx.telegramBotTmaUrl),
    }
  }

  const draft = await findDraftById(ctx.db, draftId)

  if (!draft) {
    return {
      text: 'Không tìm thấy yêu cầu thêm chi tiêu.',
      parseMode: 'HTML',
    }
  }

  let preview: ParsedPreviewData

  try {
    preview = JSON.parse(draft.previewJson) as ParsedPreviewData
  } catch {
    return {
      text: 'Dữ liệu xem trước không hợp lệ.',
      parseMode: 'HTML',
    }
  }

  const currencyCode =
    preview.scope === 'household' && preview.householdId
      ? ((await findHouseholdById(ctx.db, preview.householdId))
          ?.defaultCurrencyCode ?? 'VND')
      : 'VND'

  return {
    mode: 'edit',
    targetMessageId: messageId,
    text: renderExpensePreviewText(preview, currencyCode, { compact: false }),
    parseMode: 'HTML',
    replyMarkup: expensePreviewFullKeyboard(draftId),
  }
}
