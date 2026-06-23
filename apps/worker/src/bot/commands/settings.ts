import {
  findTelegramBotChatByUserId,
  updateTelegramBotChatPreferences,
} from '@/db/repositories/telegram-bot-chat-repository'

import { TMA_URL } from '../constants'
import { openAppKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

export interface TelegramBotPreferences {
  budget_alerts: boolean
  household_activity: boolean
  weekly_digest: boolean
}

const DEFAULT_PREFERENCES: TelegramBotPreferences = {
  budget_alerts: true,
  household_activity: false,
  weekly_digest: false,
}

/**
 * Parse a raw JSON preferences string into a validated preferences object.
 * Falls back to defaults on any parse error or missing field.
 */
export const parsePreferences = (raw: string): TelegramBotPreferences => {
  try {
    const parsed = JSON.parse(raw)

    return {
      budget_alerts:
        typeof parsed.budget_alerts === 'boolean'
          ? parsed.budget_alerts
          : DEFAULT_PREFERENCES.budget_alerts,
      household_activity:
        typeof parsed.household_activity === 'boolean'
          ? parsed.household_activity
          : DEFAULT_PREFERENCES.household_activity,
      weekly_digest:
        typeof parsed.weekly_digest === 'boolean'
          ? parsed.weekly_digest
          : DEFAULT_PREFERENCES.weekly_digest,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

/**
 * Build the settings keyboard from current preferences.
 */
const buildSettingsKeyboard = (
  prefs: TelegramBotPreferences,
): BotResponse['replyMarkup'] => ({
  inline_keyboard: [
    [
      {
        text: prefs.budget_alerts
          ? '🔔 Cảnh báo ngân sách: Bật'
          : '🔕 Cảnh báo ngân sách: Tắt',
        callback_data: 'pref:budget_alerts',
      },
    ],
    [
      {
        text: prefs.household_activity
          ? '🏠 Thông báo gia đình: Bật'
          : '🚫 Thông báo gia đình: Tắt',
        callback_data: 'pref:household_activity',
      },
    ],
    [
      {
        text: prefs.weekly_digest
          ? '📬 Bản tin hàng tuần: Bật'
          : '📭 Bản tin hàng tuần: Tắt',
        callback_data: 'pref:weekly_digest',
      },
    ],
    [{ text: '🏠 Mở Mini App', web_app: { url: TMA_URL } }],
  ],
})

/**
 * Handle /settings command.
 *
 * Shows current notification preference toggles.
 * Unlinked users get Open App guidance.
 */
export const handleSettingsCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập và quản lý cài đặt.\n\n' +
        '🏠 <a href="' +
        TMA_URL +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(),
    }
  }

  const chat = await findTelegramBotChatByUserId(ctx.db, String(ctx.userId))
  const prefs = chat
    ? parsePreferences(chat.preferences)
    : { ...DEFAULT_PREFERENCES }

  return {
    text:
      '⚙️ <b>Cài đặt thông báo</b>\n\n' +
      'Chọn một tùy chọn bên dưới để bật/tắt:',
    parseMode: 'HTML',
    replyMarkup: buildSettingsKeyboard(prefs),
  }
}

/**
 * Handle a preference toggle callback (pref:*).
 * Reads current preferences, flips the toggled one, persists, re-renders.
 */
export const handlePreferenceToggle = async (
  ctx: CommandContext,
  prefKey: string,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập.\n\n' +
        '🏠 <a href="' +
        TMA_URL +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(),
    }
  }

  const db = ctx.db
  const telegramUserId = String(ctx.userId)
  const chat = await findTelegramBotChatByUserId(db, telegramUserId)

  // Ensure chat record exists with defaults
  if (!chat) {
    return {
      text: 'Không tìm thấy thông tin người dùng. Vui lòng thử lại sau.',
      parseMode: 'HTML',
    }
  }

  const prefs = parsePreferences(chat.preferences)

  // Flip the toggled preference if it's a known key
  if (
    prefKey === 'budget_alerts' ||
    prefKey === 'household_activity' ||
    prefKey === 'weekly_digest'
  ) {
    prefs[prefKey] = !prefs[prefKey]
  }

  await updateTelegramBotChatPreferences(
    db,
    telegramUserId,
    JSON.stringify(prefs),
  )

  return {
    text:
      '⚙️ <b>Cài đặt thông báo</b>\n\n' +
      'Chọn một tùy chọn bên dưới để bật/tắt:',
    parseMode: 'HTML',
    replyMarkup: buildSettingsKeyboard(prefs),
  }
}
