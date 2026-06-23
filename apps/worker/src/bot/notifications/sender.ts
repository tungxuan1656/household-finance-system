import { parsePreferences } from '@/bot/commands/settings'
import { type TelegramClient } from '@/bot/telegram-client'
import type { InlineKeyboardMarkup } from '@/bot/types'
import { findTelegramBotChatByUserId } from '@/db/repositories/telegram-bot-chat-repository'
import {
  hasDelivery,
  insertDelivery,
  type NotificationType,
} from '@/db/repositories/telegram-bot-notification-delivery-repository'

export interface SendNotificationOptions {
  db: D1Database
  telegramClient: TelegramClient
  telegramUserId: string
  notificationType: NotificationType
  dedupeKey: string
  text: string
  parseMode?: 'HTML' | 'MarkdownV2'
  replyMarkup?: InlineKeyboardMarkup
  /** Preferences gate key. When set, checks the preference before sending. */
  requiredPref?: 'budget_alerts' | 'household_activity' | 'weekly_digest'
}

/**
 * Send a notification to a Telegram user with preference gating,
 * deduplication, and delivery logging.
 *
 * Returns the delivery status: 'sent', 'skipped', or 'failed'.
 * Skips when:
 *  - required preference is off
 *  - delivery already exists for the dedupe key
 *  - chat record not found or unlinked
 */
export const sendNotification = async (
  options: SendNotificationOptions,
): Promise<'sent' | 'skipped' | 'failed'> => {
  const {
    db,
    telegramClient,
    telegramUserId,
    notificationType,
    dedupeKey,
    text,
    parseMode,
    replyMarkup,
  } = options

  // 1. Find chat record
  const chat = await findTelegramBotChatByUserId(db, telegramUserId)

  if (!chat || !chat.userId) {
    // Unlinked user — skip silently
    await insertDelivery(db, {
      telegramUserId,
      notificationType,
      dedupeKey,
      status: 'skipped',
      payloadJson: JSON.stringify({ reason: 'unlinked' }),
    })

    return 'skipped'
  }

  // 2. Check preference gate
  if (options.requiredPref) {
    const prefs = parsePreferences(chat.preferences)

    if (!prefs[options.requiredPref]) {
      await insertDelivery(db, {
        telegramUserId,
        notificationType,
        dedupeKey,
        status: 'skipped',
        payloadJson: JSON.stringify({
          reason: `pref_${options.requiredPref}_off`,
        }),
      })

      return 'skipped'
    }
  }

  // 3. Check deduplication
  const alreadySent = await hasDelivery(
    db,
    telegramUserId,
    notificationType,
    dedupeKey,
  )

  if (alreadySent) {
    await insertDelivery(db, {
      telegramUserId,
      notificationType,
      dedupeKey,
      status: 'skipped',
      payloadJson: JSON.stringify({ reason: 'deduplicated' }),
    })

    return 'skipped'
  }

  // 4. Send via Telegram API
  try {
    await telegramClient.sendMessage(telegramUserId, text, {
      parseMode,
      replyMarkup,
    })

    await insertDelivery(db, {
      telegramUserId,
      notificationType,
      dedupeKey,
      status: 'sent',
    })

    return 'sent'
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'unknown error'

    await insertDelivery(db, {
      telegramUserId,
      notificationType,
      dedupeKey,
      status: 'failed',
      errorMessage: errorMsg,
    })

    return 'failed'
  }
}
