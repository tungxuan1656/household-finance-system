import { newId } from '@/utils/id'

/**
 * Default preferences JSON string used when creating new chat records
 * or when parsing malformed stored preferences.
 */
export const DEFAULT_PREFERENCES_JSON =
  '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}'

export interface StoredTelegramBotChat {
  id: string
  telegramUserId: string
  telegramChatId: string
  userId: string | null
  preferences: string
  locale: string
  createdAt: number
  updatedAt: number
}

export interface UpsertTelegramBotChatInput {
  telegramUserId: string
  telegramChatId: string
  userId?: string | null
  locale?: string
}

const toStoredChat = (row: {
  id: string
  telegram_user_id: string
  telegram_chat_id: string
  user_id: string | null
  preferences: string
  locale: string
  created_at: number
  updated_at: number
}): StoredTelegramBotChat => ({
  id: row.id,
  telegramUserId: row.telegram_user_id,
  telegramChatId: row.telegram_chat_id,
  userId: row.user_id,
  preferences: row.preferences,
  locale: row.locale,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const findTelegramBotChatByUserId = async (
  db: D1Database,
  telegramUserId: string,
): Promise<StoredTelegramBotChat | null> => {
  const row = await db
    .prepare(
      `SELECT id,
              telegram_user_id,
              telegram_chat_id,
              user_id,
              preferences,
              locale,
              created_at,
              updated_at
         FROM telegram_bot_chats
        WHERE telegram_user_id = ?
        LIMIT 1`,
    )
    .bind(telegramUserId)
    .first<{
      id: string
      telegram_user_id: string
      telegram_chat_id: string
      user_id: string | null
      preferences: string
      locale: string
      created_at: number
      updated_at: number
    }>()

  return row ? toStoredChat(row) : null
}

/**
 * Upsert a telegram_bot_chat record.
 * Uses INSERT OR REPLACE on the unique telegram_user_id index.
 * Safe to re-run: webhook retries must not create duplicates.
 */
export const upsertTelegramBotChat = async (
  db: D1Database,
  input: UpsertTelegramBotChatInput,
): Promise<StoredTelegramBotChat> => {
  const nowEpoch = Date.now()

  await db
    .prepare(
      `INSERT INTO telegram_bot_chats
         (id, telegram_user_id, telegram_chat_id, user_id, locale, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(telegram_user_id)
       DO UPDATE SET
         telegram_chat_id = excluded.telegram_chat_id,
         user_id = COALESCE(excluded.user_id, telegram_bot_chats.user_id),
         locale = COALESCE(excluded.locale, telegram_bot_chats.locale),
         updated_at = excluded.updated_at`,
    )
    .bind(
      newId(),
      input.telegramUserId,
      input.telegramChatId,
      input.userId ?? null,
      input.locale ?? 'vi',
      nowEpoch,
      nowEpoch,
    )
    .run()

  const saved = await findTelegramBotChatByUserId(db, input.telegramUserId)

  return (
    saved ?? {
      id: '',
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId,
      userId: input.userId ?? null,
      preferences: DEFAULT_PREFERENCES_JSON,
      locale: input.locale ?? 'vi',
      createdAt: nowEpoch,
      updatedAt: nowEpoch,
    }
  )
}

/**
 * Update the preferences column for a telegram_bot_chat record.
 * Uses the unique telegram_user_id index to find the row.
 */
export const updateTelegramBotChatPreferences = async (
  db: D1Database,
  telegramUserId: string,
  preferencesJson: string,
): Promise<void> => {
  await db
    .prepare(
      `UPDATE telegram_bot_chats
          SET preferences = ?,
              updated_at = ?
        WHERE telegram_user_id = ?`,
    )
    .bind(preferencesJson, Date.now(), telegramUserId)
    .run()
}
