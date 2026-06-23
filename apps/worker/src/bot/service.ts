import { resolveLocale } from '@/lib/i18n'
import type { AppConfig } from '@/types'

import { findAppUserIdByTelegramId } from './account-linking'
import { handleAiExpenseCommand } from './commands/ai-expense'
import { handleBudgetCommand } from './commands/budget'
import {
  handleCancelExpense,
  handleConfirmExpense,
  handleRetryExpense,
} from './commands/confirm-expense'
import { handleHelpCommand } from './commands/help'
import { handleHouseholdSelect } from './commands/household-select'
import {
  handlePreferenceToggle,
  handleSettingsCommand,
} from './commands/settings'
import { handleStartCommand } from './commands/start'
import { handleStatsCommand } from './commands/stats'
import { handleTopCommand } from './commands/top'
import { TelegramClient } from './telegram-client'
import type { BotResponse, TelegramUpdate } from './types'

export interface BotServiceDeps {
  db: D1Database
  config: Pick<AppConfig, 'telegramBotToken'>
  telegramClient?: TelegramClient
  /**
   * Pre-resolved app user id to avoid duplicate identity lookup.
   * When set, skips the findAppUserIdByTelegramId call.
   * null means the identity was checked and does not exist.
   */
  resolvedAppUserId?: string | null
  /** Worker env bag for commands that need it (AI config, etc.). */
  env?: Record<string, string | undefined>
}

interface BuildCtxOptions {
  userId: number
  chatId: number
  text: string
  appUserId: string | null
  deps: BotServiceDeps
  firstName?: string
  lastName?: string
  languageCode?: string
}

const buildCtx = (o: BuildCtxOptions) => ({
  userId: o.userId,
  chatId: o.chatId,
  userDisplayName:
    [o.firstName, o.lastName].filter(Boolean).join(' ').trim() || null,
  text: o.text,
  appUserId: o.appUserId,
  locale: resolveLocale(o.languageCode ?? null),
  db: o.deps.db,
  env: o.deps.env,
})

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
 * Handle a callback query from an inline keyboard button.
 */
const handleCallbackQuery = async (
  cq: NonNullable<TelegramUpdate['callback_query']>,
  deps: BotServiceDeps,
  client: TelegramClient,
): Promise<number> => {
  if (!cq.data || !cq.from || cq.from.is_bot) {
    return 0
  }

  const appUserId =
    deps.resolvedAppUserId !== undefined
      ? deps.resolvedAppUserId
      : await findAppUserIdByTelegramId(deps.db, String(cq.from.id))

  const message = cq.message
  const chatId = message?.chat.id ?? cq.from.id

  const ctx = buildCtx({
    userId: cq.from.id,
    chatId,
    text: cq.data,
    appUserId,
    deps,
    firstName: cq.from.first_name,
    lastName: cq.from.last_name,
    languageCode: cq.from.language_code,
  })

  return processCallbackAction(cq.data, ctx, client, cq.id, chatId)
}

/**
 * Process a callback query action: dispatch to handler, send message, answer callback.
 */
const processCallbackAction = async (
  data: string,
  ctx: ReturnType<typeof buildCtx>,
  client: TelegramClient,
  cqId: string,
  chatId: number,
): Promise<number> => {
  const parts = data.split(':')
  const action = parts[0]
  const draftId = parts[1]
  const payload = parts.slice(2).join(':')

  let result: BotResponse

  switch (action) {
    case 'confirm': {
      result = await handleConfirmExpense(ctx, draftId)
      break
    }
    case 'cancel': {
      result = await handleCancelExpense(ctx, draftId)
      break
    }
    case 'retry': {
      result = await handleRetryExpense(ctx, draftId)
      break
    }
    case 'household':
    case 'hhselect': {
      result = await handleHouseholdSelect(ctx, draftId, payload)
      break
    }
    case 'pref': {
      result = await handlePreferenceToggle(ctx, draftId)
      break
    }
    case 'settings': {
      result = await handleSettingsCommand(ctx)
      break
    }
    case 'stats': {
      result = await handleStatsCommand(ctx)
      break
    }
    case 'budget': {
      result = await handleBudgetCommand(ctx)
      break
    }
    case 'add_expense': {
      result = {
        text:
          'Vui lòng nhập nội dung chi tiêu bằng lệnh /ai.\n\n' +
          'Ví dụ: <code>/ai ăn bún 30k 15/6</code>',
        parseMode: 'HTML' as const,
      }

      break
    }
    default: {
      // Quietly answer unknown callback
      try {
        await client.answerCallbackQuery(cqId)
      } catch {
        /* non-critical */
      }

      return 0
    }
  }

  await client.sendMessage(chatId, result.text, {
    parseMode: result.parseMode,
    replyMarkup: result.replyMarkup,
  })

  try {
    await client.answerCallbackQuery(cqId)
  } catch {
    /* non-critical */
  }

  return 1
}

/**
 * Handle a regular message update.
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

  if (!isBotCommand) {
    return 0
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

  let result

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
    case 'ai': {
      result = await handleAiExpenseCommand(ctx)
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

/**
 * Extract the command name from a message text.
 * Supports /command, /command@botname, and fullwidth variants.
 */
const extractCommand = (text: string): string => {
  const normalized =
    text
      .replace(/^[！!]/, '/')
      .split(/\s+/)[0]
      ?.toLowerCase()
      ?.replace(/@\w+$/, '')
      ?.replace(/^\//, '') ?? ''

  return normalized
}
