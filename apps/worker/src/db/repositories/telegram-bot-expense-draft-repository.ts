import { newId } from '@/utils/id'

const DRAFT_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

export type DraftStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled'

export interface StoredDraft {
  id: string
  telegramUserId: string
  telegramChatId: string
  dedupeKey: string
  previewJson: string
  status: DraftStatus
  createdExpenseId: string | null
  locale: string
  createdAt: number
  updatedAt: number
}

export interface CreateDraftInput {
  telegramUserId: string
  telegramChatId: string
  dedupeKey: string
  previewJson: string
  locale?: string
}

const mapDraft = (row: {
  id: string
  telegram_user_id: string
  telegram_chat_id: string
  dedupe_key: string
  preview_json: string
  status: string
  created_expense_id: string | null
  locale: string
  created_at: number
  updated_at: number
}): StoredDraft => ({
  id: row.id,
  telegramUserId: row.telegram_user_id,
  telegramChatId: row.telegram_chat_id,
  dedupeKey: row.dedupe_key,
  previewJson: row.preview_json,
  status: row.status as DraftStatus,
  createdExpenseId: row.created_expense_id,
  locale: row.locale,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

/**
 * Upsert a draft by (telegram_user_id, dedupe_key).
 * Returns the draft.
 */
export const upsertDraft = async (
  db: D1Database,
  input: CreateDraftInput,
): Promise<StoredDraft> => {
  const nowEpoch = Date.now()

  // Idempotency: if a draft with this dedupe key is already confirmed,
  // return it unchanged so a re-issued /add cannot re-arm a confirmed state
  // and silently bypass dedupe.
  const existing = await findDraftByDedupeKey(
    db,
    input.telegramUserId,
    input.dedupeKey,
  )

  if (existing && existing.status === 'confirmed') {
    return existing
  }

  await db
    .prepare(
      `INSERT INTO telegram_bot_expense_drafts
         (id, telegram_user_id, telegram_chat_id, dedupe_key, preview_json, locale, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(telegram_user_id, dedupe_key)
       DO UPDATE SET
         preview_json = excluded.preview_json,
         status = 'pending',
         created_expense_id = NULL,
         locale = excluded.locale,
         updated_at = excluded.updated_at`,
    )
    .bind(
      newId(),
      input.telegramUserId,
      input.telegramChatId,
      input.dedupeKey,
      input.previewJson,
      input.locale ?? 'vi',
      nowEpoch,
      nowEpoch,
    )
    .run()

  // Fetch back after upsert
  const draft = await findDraftByDedupeKey(
    db,
    input.telegramUserId,
    input.dedupeKey,
  )

  if (!draft) {
    throw new Error('Failed to create draft: no row returned')
  }

  return draft
}

export const findDraftById = async (
  db: D1Database,
  draftId: string,
): Promise<StoredDraft | null> => {
  const row = await db
    .prepare(
      `SELECT id,
              telegram_user_id,
              telegram_chat_id,
              dedupe_key,
              preview_json,
              status,
              created_expense_id,
              locale,
              created_at,
              updated_at
         FROM telegram_bot_expense_drafts
        WHERE id = ?
        LIMIT 1`,
    )
    .bind(draftId)
    .first<{
      id: string
      telegram_user_id: string
      telegram_chat_id: string
      dedupe_key: string
      preview_json: string
      status: string
      created_expense_id: string | null
      locale: string
      created_at: number
      updated_at: number
    }>()

  return row ? mapDraft(row) : null
}

export const findDraftByDedupeKey = async (
  db: D1Database,
  telegramUserId: string,
  dedupeKey: string,
): Promise<StoredDraft | null> => {
  const row = await db
    .prepare(
      `SELECT id,
              telegram_user_id,
              telegram_chat_id,
              dedupe_key,
              preview_json,
              status,
              created_expense_id,
              locale,
              created_at,
              updated_at
         FROM telegram_bot_expense_drafts
        WHERE telegram_user_id = ?
          AND dedupe_key = ?
        LIMIT 1`,
    )
    .bind(telegramUserId, dedupeKey)
    .first<{
      id: string
      telegram_user_id: string
      telegram_chat_id: string
      dedupe_key: string
      preview_json: string
      status: string
      created_expense_id: string | null
      locale: string
      created_at: number
      updated_at: number
    }>()

  return row ? mapDraft(row) : null
}

/**
 * Mark a draft as confirmed, recording the created expense id.
 * Returns the updated draft.
 *
 * Accepts both 'pending' (caller invoked without prior claim) and
 * 'confirming' (caller already won the CAS claim) so the confirmed
 * transition always succeeds after the expense has been created.
 */
export const markDraftConfirmed = async (
  db: D1Database,
  draftId: string,
  expenseId: string,
): Promise<StoredDraft | null> => {
  const nowEpoch = Date.now()

  await db
    .prepare(
      `UPDATE telegram_bot_expense_drafts
          SET status = 'confirmed',
              created_expense_id = ?,
              updated_at = ?
        WHERE id = ?
          AND status IN ('pending', 'confirming')`,
    )
    .bind(expenseId, nowEpoch, draftId)
    .run()

  return findDraftById(db, draftId)
}

/**
 * Atomically claim a draft for confirmation (CAS pattern).
 * Updates status from 'pending' to 'confirming' and returns true
 * if the row was affected. Only one concurrent caller can succeed.
 */
export const claimDraftForConfirm = async (
  db: D1Database,
  draftId: string,
): Promise<boolean> => {
  const result = await db
    .prepare(
      `UPDATE telegram_bot_expense_drafts
          SET status = 'confirming',
              updated_at = ?
        WHERE id = ?
          AND status = 'pending'`,
    )
    .bind(Date.now(), draftId)
    .run()

  return (result.meta.changes ?? 0) > 0
}

/**
 * Mark a draft as expired.
 * Accepts both 'pending' and 'confirming' so a draft claimed but never
 * confirmed (e.g., a worker crash between CAS and markDraftConfirmed)
 * can still be reaped.
 */
export const expireDraft = async (
  db: D1Database,
  draftId: string,
): Promise<void> => {
  await db
    .prepare(
      `UPDATE telegram_bot_expense_drafts
          SET status = 'expired',
              updated_at = ?
        WHERE id = ?
          AND status IN ('pending', 'confirming')`,
    )
    .bind(Date.now(), draftId)
    .run()
}

/**
 * Check whether a draft has expired (10 min window).
 */
export const isDraftExpired = (draft: StoredDraft): boolean =>
  Date.now() - draft.createdAt > DRAFT_EXPIRY_MS

export interface PreviewData {
  amountMinor: number
  occurredAt: string
  categoryKey: string
  title: string
  sourceKey: string
  scope: 'personal' | 'household'
  householdId?: string
  householdName?: string
  groupName?: string
}

export interface CreateDraftFromPreviewOptions {
  db: D1Database
  telegramUserId: string
  telegramChatId: string
  dedupeKey: string
  preview: PreviewData
  locale: string
}

/**
 * Create a draft from a parsed preview, serializing the preview to JSON.
 */
export const createDraftFromPreview = async (
  options: CreateDraftFromPreviewOptions,
): Promise<StoredDraft> => {
  const { db, telegramUserId, telegramChatId, dedupeKey, preview, locale } =
    options

  return upsertDraft(db, {
    telegramUserId,
    telegramChatId,
    dedupeKey,
    previewJson: JSON.stringify(preview),
    locale,
  })
}
