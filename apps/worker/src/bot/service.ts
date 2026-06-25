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
import { handleBudgetCommand } from './commands/budget'
import { handleHelpCommand } from './commands/help'
import { runNaturalExpenseCreate } from './commands/natural-expense'
import { handleSettingsCommand } from './commands/settings'
import { handleStartCommand } from './commands/start'
import { handleStatsCommand } from './commands/stats'
import { handleTopCommand } from './commands/top'
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
 *
 * Natural input (feat-121) bypasses the preview/confirm step and
 * creates each parsed expense immediately. `/ai` and `/aimulti` keep
 * their preview → confirm flow.
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
  // feat-121: direct-create flow — see commands/natural-expense.ts.
  if (!isBotCommand) {
    if (message.chat.type !== 'private') return 0

    const appUserId =
      deps.resolvedAppUserId !== undefined
        ? deps.resolvedAppUserId
        : await findAppUserIdByTelegramId(deps.db, String(message.from.id))

    if (!appUserId) return 0

    return runNaturalExpenseCreate(
      deps,
      client,
      { ...message, from: message.from },
      appUserId,
    )
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
