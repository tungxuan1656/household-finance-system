import { findIdentityUserId } from '@/db/repositories/user-repository'

/**
 * Look up the local app user id by Telegram user id.
 * Returns null when the Telegram user has never authenticated via the TMA.
 * Bot never creates a user by chat alone.
 */
export const findAppUserIdByTelegramId = async (
  db: D1Database,
  telegramUserId: string,
): Promise<string | null> => {
  return findIdentityUserId(db, 'telegram', telegramUserId)
}
