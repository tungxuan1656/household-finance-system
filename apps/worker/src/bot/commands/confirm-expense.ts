import { renderExpenseSummaryLine } from '@/bot/format'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import { createExpense } from '@/db/repositories/expense-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import type { PreviewData } from '@/db/repositories/telegram-bot-expense-draft-repository'
import {
  claimDraftForConfirm,
  expireDraft,
  findDraftById,
  isDraftExpired,
  markDraftConfirmed,
} from '@/db/repositories/telegram-bot-expense-draft-repository'
import { newId } from '@/utils/id'

import { openAppKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

/**
 * Handle a confirm expense action.
 * Looks up the draft, checks expiry, verifies household membership for household scope,
 * creates the expense with created_via_bot=1, writes audit log, marks draft confirmed.
 * Idempotent for repeated confirms.
 */
export const handleConfirmExpense = async (
  ctx: CommandContext,
  draftId: string,
  messageId?: number,
): Promise<BotResponse> => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      text:
        'Mở Mini App để đăng nhập.\n\n' +
        '🏠 <a href="' +
        tmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(tmaUrl),
    }
  }

  const db = ctx.db
  const draft = await findDraftById(db, draftId)

  if (!draft) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Không tìm thấy yêu cầu. Thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Check expiry
  if (isDraftExpired(draft)) {
    await expireDraft(db, draft.id).catch(() => {})

    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Hết hạn (10 phút). Thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Check if already confirmed — idempotent
  if (draft.status === 'confirmed' && draft.createdExpenseId) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text:
        '✅ Đã thêm trước đó.\n\n' +
        `Mã: <code>${draft.createdExpenseId}</code>`,
      parseMode: 'HTML',
    }
  }

  // Atomically claim the draft (CAS — HIGH 3). Only one concurrent caller succeeds.
  const claimed = await claimDraftForConfirm(db, draft.id)

  if (!claimed) {
    // Another request claimed it first — re-read to see if it's confirmed
    const updatedDraft = await findDraftById(db, draft.id)

    if (updatedDraft?.status === 'confirmed' && updatedDraft.createdExpenseId) {
      return {
        mode: 'edit',
        targetMessageId: messageId,
        text:
          '✅ Chi tiêu này đã được thêm trước đó.\n\n' +
          `Mã giao dịch: <code>${updatedDraft.createdExpenseId}</code>`,
        parseMode: 'HTML',
      }
    }

    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Đã xử lý. Thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Parse the preview
  let preview: PreviewData

  try {
    preview = JSON.parse(draft.previewJson) as PreviewData
  } catch {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Dữ liệu không hợp lệ. Thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Defense-in-depth: verify household membership for household scope
  if (preview.scope === 'household' && preview.householdId) {
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

    if (!householdIds.includes(preview.householdId)) {
      return {
        mode: 'edit',
        targetMessageId: messageId,
        text: 'Không có quyền thêm vào hộ này.',
        parseMode: 'HTML',
      }
    }
  }

  // Determine currency
  const currencyCode =
    preview.scope === 'household' && preview.householdId
      ? ((await findHouseholdById(db, preview.householdId))
          ?.defaultCurrencyCode ?? 'VND')
      : 'VND'

  // Create the expense
  const expenseId = newId()
  const occurredAtMs = Date.parse(preview.occurredAt)

  const expense = await createExpense(db, {
    id: expenseId,
    householdId:
      preview.scope === 'household' ? (preview.householdId ?? null) : null,
    spentByUserId: ctx.appUserId,
    categoryKey: preview.categoryKey,
    sourceKey: preview.sourceKey,
    amountMinor: preview.amountMinor,
    currencyCode,
    occurredAt: occurredAtMs,
    title: preview.title,
    note: `Tạo qua Telegram bot`,
    createdViaBot: 1,
  })

  // Mark draft confirmed
  await markDraftConfirmed(db, draft.id, expense.id)

  // Write audit log
  await createAuditLogEntry(db, {
    householdId: expense.householdId,
    actorUserId: ctx.appUserId,
    actionType: 'expense.created',
    targetType: 'expense',
    targetId: expense.id,
    payloadJson: JSON.stringify({
      source: 'telegram_bot',
      expenseId: expense.id,
    }),
  }).catch((err: unknown) => {
    console.error('confirm-expense: audit log write failed', err)
  })

  return {
    mode: 'edit',
    targetMessageId: messageId,
    text: `✅ ${renderExpenseSummaryLine({ ...preview, currencyCode })}`,
    parseMode: 'HTML',
  }
}

/**
 * Handle a cancel expense action. Marks draft cancelled.
 * Edits the preview message in place to a "Đã huỷ" state with no buttons,
 * keeping the chat clean (no extra bubble).
 */
export const handleCancelExpense = async (
  ctx: CommandContext,
  draftId: string,
  messageId?: number,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Hủy bỏ.',
      parseMode: 'HTML',
    }
  }

  const db = ctx.db
  const draft = await findDraftById(db, draftId)

  if (draft && draft.status === 'pending') {
    await expireDraft(db, draft.id).catch(() => {})
  }

  return {
    mode: 'edit',
    targetMessageId: messageId,
    text: 'Đã huỷ thêm chi tiêu.',
    parseMode: 'HTML',
  }
}

/**
 * Handle a retry action — tells user to send a new /ai command.
 * The retry button was removed from the preview keyboard, but stale
 * messages may still carry the callback. Edits in place for hygiene.
 */
export const handleRetryExpense = async (
  _ctx: CommandContext,
  _draftId: string,
  messageId?: number,
): Promise<BotResponse> => ({
  mode: 'edit',
  targetMessageId: messageId,
  text: 'Gửi lại bằng /ai.\n\n' + 'Vd: <code>/ai ăn bún 30k 15/6</code>',
  parseMode: 'HTML',
})
