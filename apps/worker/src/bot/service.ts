import { AiUpstreamError, parseExpensesWithAi } from '@/lib/ai/expense-parser'

import { findAppUserIdByTelegramId } from './account-linking'
import type { BotServiceDeps } from './callback-dispatcher'
import {
  buildCtx,
  extractCommand,
  handleCallbackQuery,
} from './callback-dispatcher'
import {
  runAiExpenseCommand,
  runAiMultiExpenseCommand,
} from './commands/ai-expense-service'
import {
  buildDraftFromItem,
  normalizeAiItem,
} from './commands/ai-expense-shared'
import { handleBudgetCommand } from './commands/budget'
import { handleHelpCommand } from './commands/help'
import { handleSettingsCommand } from './commands/settings'
import { handleStartCommand } from './commands/start'
import { handleStatsCommand } from './commands/stats'
import { handleTopCommand } from './commands/top'
import { detectAmountInVnd, looksLikeExpense } from './lib/vn-amount-detector'
import { renderExpensePreviewText } from './renderers/finance-text'
import { expensePreviewKeyboard } from './renderers/keyboards'
import { TelegramClient } from './telegram-client'
import type { BotResponse, TelegramUpdate } from './types'

export type { BotServiceDeps }

export const handleUpdate = async (
  update: TelegramUpdate,
  deps: BotServiceDeps,
): Promise<number> => {
  const client =
    deps.telegramClient ?? new TelegramClient(deps.config.telegramBotToken)

  if (update.callback_query)
    return handleCallbackQuery(update.callback_query, deps, client)

  return handleMessageUpdate(update, deps, client)
}

/**
 * Handle a regular message update.
 * Supports bot commands and natural expense input.
 */
const handleMessageUpdate = async (
  update: TelegramUpdate,
  deps: BotServiceDeps,
  client: TelegramClient,
): Promise<number> => {
  const message = update.message

  if (!message?.text || !message.from || message.from.is_bot) {
    return 0
  }

  const text = message.text.trim()
  const isBotCommand =
    text.startsWith('/') || text.startsWith('！') || text.startsWith('!')

  // ── Natural expense input (non-command, private chat, linked user) ─────
  if (!isBotCommand) {
    // Only process in private chats for linked users
    if (message.chat.type !== 'private') return 0

    const appUserId =
      deps.resolvedAppUserId !== undefined
        ? deps.resolvedAppUserId
        : await findAppUserIdByTelegramId(deps.db, String(message.from.id))

    if (!appUserId) return 0
    if (!looksLikeExpense(text)) return 0

    const amountResult = detectAmountInVnd(text)

    if (!amountResult) return 0

    // Check AI config
    if (
      !deps.env?.OPENAI_COMPAT_BASE_URL ||
      !deps.env?.OPENAI_COMPAT_API_KEY ||
      !deps.env?.OPENAI_COMPAT_MODEL
    ) {
      return 0
    }

    // ── Send loader message ─────────────────────────────────────────
    const loaderMsgId = await client.sendMessage(
      message.chat.id,
      '⏳ Đang phân tích chi tiêu...',
    )

    // Call AI parser for category/date/source
    let rawItems: Array<{
      amount: number
      categoryKey: string
      sourceKey?: string
      title: string
      occurredAt?: string
    }>

    try {
      rawItems = await parseExpensesWithAi(
        text,
        {
          baseUrl: deps.env.OPENAI_COMPAT_BASE_URL,
          apiKey: deps.env.OPENAI_COMPAT_API_KEY,
          model: deps.env.OPENAI_COMPAT_MODEL,
        },
        { defaultOccurredAt: new Date().toISOString().slice(0, 10) },
      )
    } catch (error) {
      if (error instanceof AiUpstreamError) {
        await client.editMessageText(
          message.chat.id,
          loaderMsgId,
          'Rất tiếc, dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
          { parseMode: 'HTML' },
        )

        return 1
      }

      throw error
    }

    if (rawItems.length === 0) {
      await client.editMessageText(
        message.chat.id,
        loaderMsgId,
        'Không thể nhận diện chi tiêu từ tin nhắn của bạn. Vui lòng thử lại với cách viết khác.',
        { parseMode: 'HTML' },
      )

      return 1
    }

    // Normalize the first valid item
    const defaultDate = new Date().toISOString().slice(0, 10)
    let validItem = normalizeAiItem(rawItems[0]!, defaultDate)

    if (!validItem) {
      await client.editMessageText(
        message.chat.id,
        loaderMsgId,
        'Thiếu thông tin bắt buộc (số tiền, danh mục, ngày, nội dung). Vui lòng thử lại.',
        { parseMode: 'HTML' },
      )

      return 1
    }

    // Override AI amount with our detected amount (more reliable)
    validItem = { ...validItem, amount: amountResult.amountVnd }

    // Build preview + draft
    const ctx = buildCtx({
      userId: message.from.id,
      chatId: message.chat.id,
      text,
      appUserId,
      deps,
      firstName: message.from.first_name,
      lastName: message.from.last_name,
      languageCode: message.from.language_code,
    })

    const built = await buildDraftFromItem(ctx, validItem, {
      rawText: text,
      defaultDate,
    })

    if ('status' in built) {
      // Already-confirmed expense (dedupe hit) — edit loader with confirmation
      await client.editMessageText(message.chat.id, loaderMsgId, built.text, {
        parseMode: 'HTML',
        replyMarkup: built.replyMarkup,
      })

      return 1
    }

    // Edit loader with full preview
    const previewText = renderExpensePreviewText(
      built.preview,
      built.currencyCode,
    )

    await client.editMessageText(message.chat.id, loaderMsgId, previewText, {
      parseMode: 'HTML',
      replyMarkup: expensePreviewKeyboard(built.draftId),
    })

    return 1
  }

  const command = extractCommand(text)
  const appUserId =
    deps.resolvedAppUserId !== undefined
      ? deps.resolvedAppUserId
      : await findAppUserIdByTelegramId(deps.db, String(message.from.id))

  const ctx = buildCtx({
    userId: message.from.id,
    chatId: message.chat.id,
    text,
    appUserId,
    deps,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    languageCode: message.from.language_code,
  })

  // /ai command: loader → edit flow
  if (command === 'ai') {
    return runAiExpenseCommand(update, deps, client, ctx.chatId, appUserId)
  }

  // /aimulti command: loader → first preview + N-1 more messages
  if (command === 'aimulti') {
    return runAiMultiExpenseCommand(update, deps, client, ctx.chatId, appUserId)
  }

  let result!: BotResponse

  switch (command) {
    case 'start': {
      result = await handleStartCommand(ctx)
      break
    }
    case 'help': {
      result = handleHelpCommand(ctx)
      break
    }
    case 'stats': {
      result = await handleStatsCommand(ctx)
      break
    }
    case 'top': {
      result = await handleTopCommand(ctx)
      break
    }
    case 'budget': {
      result = await handleBudgetCommand(ctx)
      break
    }
    case 'settings': {
      result = await handleSettingsCommand(ctx)
      break
    }
    default: {
      return 0
    }
  }

  await client.sendMessage(ctx.chatId, result.text, {
    parseMode: result.parseMode,
    replyMarkup: result.replyMarkup,
  })

  return 1
}
