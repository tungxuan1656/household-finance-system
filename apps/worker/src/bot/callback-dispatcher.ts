import { resolveLocale } from '@/lib/i18n'
import type { AppConfig } from '@/types'

import { findAppUserIdByTelegramId } from './account-linking'
import { handleBudgetCommand } from './commands/budget'
import {
  handleCancelExpense,
  handleConfirmExpense,
  handleRetryExpense,
} from './commands/confirm-expense'
import { handleHouseholdSelect } from './commands/household-select'
import {
  handlePreferenceToggle,
  handleSettingsCommand,
} from './commands/settings'
import { handleStatsCommand } from './commands/stats'
import { type TelegramClient } from './telegram-client'
import type { BotResponse, InlineKeyboardMarkup, TelegramUpdate } from './types'

export interface BotServiceDeps {
  db: D1Database
  config: Pick<
    AppConfig,
    'telegramBotToken' | 'telegramBotTmaUrl' | 'telegramBotDeepLinkUrl'
  >
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

export const buildCtx = (o: BuildCtxOptions) => ({
  userId: o.userId,
  chatId: o.chatId,
  userDisplayName:
    [o.firstName, o.lastName].filter(Boolean).join(' ').trim() || null,
  text: o.text,
  appUserId: o.appUserId,
  locale: resolveLocale(o.languageCode ?? null),
  db: o.deps.db,
  env: o.deps.env,
  telegramBotTmaUrl: o.deps.config.telegramBotTmaUrl,
  telegramBotDeepLinkUrl: o.deps.config.telegramBotDeepLinkUrl,
})

/**
 * Handle a callback query from an inline keyboard button.
 */
export const handleCallbackQuery = async (
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
  const messageId = message?.message_id

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

  return processCallbackAction(cq.data, ctx, client, cq.id, messageId)
}

/**
 * Process a callback query action: dispatch to handler, send/edit message, answer callback.
 * When handler returns mode='edit' + targetMessageId, edits the existing message instead of sending.
 */
const processCallbackAction = async (
  data: string,
  ctx: ReturnType<typeof buildCtx>,
  client: TelegramClient,
  cqId: string,
  messageId?: number,
): Promise<number> => {
  const parts = data.split(':')
  const action = parts[0]
  const draftId = parts[1]
  const payload = parts.slice(2).join(':')

  let result!: BotResponse

  switch (action) {
    case 'confirm': {
      result = await handleConfirmExpense(ctx, draftId, messageId)
      break
    }
    case 'cancel': {
      result = await handleCancelExpense(ctx, draftId, messageId)
      break
    }
    case 'retry': {
      result = await handleRetryExpense(ctx, draftId, messageId)
      break
    }
    case 'household':
    case 'hhselect': {
      result = await handleHouseholdSelect(ctx, draftId, payload, messageId)
      break
    }
    case 'pref': {
      result = await handlePreferenceToggle(ctx, draftId, {
        mode: 'edit',
        targetMessageId: messageId,
      })

      break
    }
    case 'settings': {
      result = await handleSettingsCommand(ctx, {
        mode: 'edit',
        targetMessageId: messageId,
      })

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

  // Send or edit message based on response mode
  if (result.mode === 'edit' && result.targetMessageId) {
    await client.editMessageText(
      ctx.chatId,
      result.targetMessageId,
      result.text,
      {
        parseMode: result.parseMode,
        replyMarkup: result.replyMarkup as InlineKeyboardMarkup | undefined,
      },
    )
  } else {
    await client.sendMessage(ctx.chatId, result.text, {
      parseMode: result.parseMode,
      replyMarkup: result.replyMarkup,
    })
  }

  try {
    await client.answerCallbackQuery(cqId)
  } catch {
    /* non-critical */
  }

  return 1
}

/**
 * Extract the command name from a message text.
 * Supports /command, /command@botname, and fullwidth variants.
 */
export const extractCommand = (text: string): string => {
  const normalized =
    text
      .replace(/^[！!]/, '/')
      .split(/\s+/)[0]
      ?.toLowerCase()
      ?.replace(/@\w+$/, '')
      ?.replace(/^\//, '') ?? ''

  return normalized
}
