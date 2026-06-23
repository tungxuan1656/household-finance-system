import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  claimDraftForConfirm,
  createDraftFromPreview,
  expireDraft,
  findDraftByDedupeKey,
  findDraftById,
  markDraftConfirmed,
  type PreviewData,
  upsertDraft,
} from '@/db/repositories/telegram-bot-expense-draft-repository'
import { applyMigrations } from '../../../helpers/apply-migrations'

const TEGRAM_USER_ID = '123456789'
const TELEGRAM_CHAT_ID = '987654321'
const DEDUPE_KEY = 'dedupe-key-1'

const PREVIEW: PreviewData = {
  amountMinor: 30000,
  occurredAt: '2026-06-15',
  categoryKey: 'food',
  title: 'ăn bún',
  sourceKey: 'bank-transfer',
  scope: 'personal',
}

describe('telegram_bot_expense_drafts state machine', () => {
  beforeEach(async () => {
    await applyMigrations(env.DB)
    await env.DB.exec('DELETE FROM telegram_bot_expense_drafts')
  })

  describe('upsertDraft idempotency', () => {
    it('returns existing confirmed draft unchanged when re-issuing same dedupe key', async () => {
      // First call: insert + confirm.
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await markDraftConfirmed(env.DB, first.id, 'expense-1')

      // Second call with the same dedupe key but a different preview payload.
      // Without the fix this would silently re-arm to 'pending' and clear
      // created_expense_id, allowing a duplicate expense on the next confirm.
      const second = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify({ ...PREVIEW, title: 'ăn phở' }),
      })

      expect(second.id).toBe(first.id)
      expect(second.status).toBe('confirmed')
      expect(second.createdExpenseId).toBe('expense-1')
      expect(JSON.parse(second.previewJson).title).toBe('ăn bún')
    })

    it('re-arms to pending when prior status is expired', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await expireDraft(env.DB, first.id)

      const second = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify({ ...PREVIEW, title: 'ăn phở' }),
      })

      expect(second.status).toBe('pending')
      expect(second.createdExpenseId).toBeNull()
      expect(JSON.parse(second.previewJson).title).toBe('ăn phở')
    })

    it('re-arms to pending when prior status is cancelled', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await env.DB.prepare(
        `UPDATE telegram_bot_expense_drafts SET status = 'cancelled' WHERE id = ?`,
      )
        .bind(first.id)
        .run()

      const second = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify({ ...PREVIEW, title: 'ăn phở' }),
      })

      expect(second.status).toBe('pending')
    })
  })

  describe('markDraftConfirmed transitions', () => {
    it('confirms a draft that is in the confirming state (post-CAS)', async () => {
      // CAS claim moves pending → confirming.
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      const claimed = await claimDraftForConfirm(env.DB, first.id)
      expect(claimed).toBe(true)

      // Without the fix this UPDATE filtered on `status = 'pending'` and
      // never matched a confirming row, leaving the draft stuck.
      const updated = await markDraftConfirmed(env.DB, first.id, 'expense-1')

      expect(updated?.status).toBe('confirmed')
      expect(updated?.createdExpenseId).toBe('expense-1')
    })

    it('confirms a draft directly from pending (no prior CAS)', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      const updated = await markDraftConfirmed(env.DB, first.id, 'expense-2')

      expect(updated?.status).toBe('confirmed')
      expect(updated?.createdExpenseId).toBe('expense-2')
    })

    it('is a no-op when the draft is already confirmed', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await markDraftConfirmed(env.DB, first.id, 'expense-1')

      const updated = await markDraftConfirmed(env.DB, first.id, 'expense-2')

      expect(updated?.createdExpenseId).toBe('expense-1')
    })
  })

  describe('expireDraft transitions', () => {
    it('expires a confirming draft (worker crashed between CAS and confirm)', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await claimDraftForConfirm(env.DB, first.id)
      await expireDraft(env.DB, first.id)

      const stored = await findDraftById(env.DB, first.id)
      expect(stored?.status).toBe('expired')
    })

    it('expires a pending draft', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await expireDraft(env.DB, first.id)

      const stored = await findDraftById(env.DB, first.id)
      expect(stored?.status).toBe('expired')
    })

    it('does not overwrite a confirmed draft', async () => {
      const first = await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      await markDraftConfirmed(env.DB, first.id, 'expense-1')

      await expireDraft(env.DB, first.id)

      const stored = await findDraftById(env.DB, first.id)
      expect(stored?.status).toBe('confirmed')
      expect(stored?.createdExpenseId).toBe('expense-1')
    })
  })

  describe('createDraftFromPreview is idempotent on confirmed drafts', () => {
    it('returns the confirmed draft without overwriting preview', async () => {
      const first = await createDraftFromPreview({
        db: env.DB,
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        preview: PREVIEW,
        locale: 'vi',
      })

      await markDraftConfirmed(env.DB, first.id, 'expense-1')

      // Re-create with a different preview — should not overwrite.
      const second = await createDraftFromPreview({
        db: env.DB,
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        preview: { ...PREVIEW, title: 'ăn phở' },
        locale: 'vi',
      })

      expect(second.status).toBe('confirmed')
      expect(second.createdExpenseId).toBe('expense-1')
      expect(JSON.parse(second.previewJson).title).toBe('ăn bún')
    })
  })

  describe('findDraftByDedupeKey', () => {
    it('returns the row matching telegramUserId + dedupeKey', async () => {
      await upsertDraft(env.DB, {
        telegramUserId: TEGRAM_USER_ID,
        telegramChatId: TELEGRAM_CHAT_ID,
        dedupeKey: DEDUPE_KEY,
        previewJson: JSON.stringify(PREVIEW),
      })

      const found = await findDraftByDedupeKey(
        env.DB,
        TEGRAM_USER_ID,
        DEDUPE_KEY,
      )

      expect(found).not.toBeNull()
      expect(found?.dedupeKey).toBe(DEDUPE_KEY)
    })

    it('returns null when no row matches', async () => {
      const found = await findDraftByDedupeKey(env.DB, 'other', 'missing')
      expect(found).toBeNull()
    })
  })
})
