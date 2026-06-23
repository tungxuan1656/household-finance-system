import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { AiUpstreamError, parseExpensesWithAi } from '@/lib/ai/expense-parser'

import { renderExpensePreviewText } from '../renderers/finance-text'
import { expensePreviewKeyboard, openAppKeyboard } from '../renderers/keyboards'
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
        'Mở Mini App để dùng.\n\n' +
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
        'Nhập nội dung chi tiêu.\n\n' + 'Vd: <code>/ai ăn bún 30k 15/6</code>',
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
      text: 'AI chưa cấu hình. Thử lại sau.',
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
        text: 'AI tạm không khả dụng. Thử lại sau.',
        parseMode: 'HTML',
      }
    }
    throw error
  }

  if (rawItems.length === 0) {
    return {
      text:
        'Chưa nhận diện được chi tiêu. Thử cách viết khác.\n\n' +
        'Vd: <code>/ai ăn bún 30k 15/6</code>',
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
        'Thiếu thông tin (tiền, danh mục, ngày, nội dung). Thử lại.\n\n' +
        'Vd: <code>/ai ăn bún 30k 15/6</code>',
      parseMode: 'HTML',
    }
  }

  // If there were extra items, note that only the first was used
  const extraNote =
    rawItems.length > 1
      ? '\n\nℹ️ Chỉ xử lý khoản đầu, các khoản sau bỏ qua.'
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
