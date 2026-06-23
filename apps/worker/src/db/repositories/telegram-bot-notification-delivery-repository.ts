import { newId } from '@/utils/id'

export type DeliveryStatus = 'sent' | 'failed' | 'skipped'
export type NotificationType =
  | 'budget_warning'
  | 'budget_exceeded'
  | 'household_activity'
  | 'weekly_digest'

export interface StoredDelivery {
  id: string
  telegramUserId: string
  notificationType: NotificationType
  dedupeKey: string
  status: DeliveryStatus
  sentAt: number
  errorMessage: string | null
  payloadJson: string | null
}

export interface CreateDeliveryInput {
  telegramUserId: string
  notificationType: NotificationType
  dedupeKey: string
  status: DeliveryStatus
  errorMessage?: string
  payloadJson?: string
}

/**
 * Insert a delivery log record.
 * Uses OR IGNORE on the unique (telegram_user_id, notification_type, dedupe_key)
 * index so repeated calls are idempotent — returns false if row already existed.
 */
export const insertDelivery = async (
  db: D1Database,
  input: CreateDeliveryInput,
): Promise<boolean> => {
  const nowEpoch = Date.now()

  try {
    await db
      .prepare(
        `INSERT OR IGNORE INTO telegram_bot_notification_deliveries
           (id, telegram_user_id, notification_type, dedupe_key, status, sent_at, error_message, payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId(),
        input.telegramUserId,
        input.notificationType,
        input.dedupeKey,
        input.status,
        nowEpoch,
        input.errorMessage ?? null,
        input.payloadJson ?? null,
      )
      .run()

    return true
  } catch {
    return false
  }
}

/**
 * Check whether a delivery already exists for the given dedupe key.
 */
export const hasDelivery = async (
  db: D1Database,
  telegramUserId: string,
  notificationType: NotificationType,
  dedupeKey: string,
): Promise<boolean> => {
  const row = await db
    .prepare(
      `SELECT 1
         FROM telegram_bot_notification_deliveries
        WHERE telegram_user_id = ?
          AND notification_type = ?
          AND dedupe_key = ?
        LIMIT 1`,
    )
    .bind(telegramUserId, notificationType, dedupeKey)
    .first<{ 1: number }>()

  return row !== null
}
