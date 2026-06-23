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

import { renderConfirmSuccessText } from '../renderers/finance-text'
import { expenseCreatedKeyboard, openAppKeyboard } from '../renderers/keyboards'
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
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập.\n\n' +
        '🏠 <a href="https://t.me/household_finance_bot/app">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(),
    }
  }

  const db = ctx.db
  const draft = await findDraftById(db, draftId)

  if (!draft) {
    return {
      text: 'Không tìm thấy yêu cầu thêm chi tiêu. Vui lòng thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Check expiry
  if (isDraftExpired(draft)) {
    await expireDraft(db, draft.id).catch(() => {})

    return {
      text: 'Phiên thêm chi tiêu đã hết hạn (10 phút). Vui lòng thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Check if already confirmed — idempotent
  if (draft.status === 'confirmed' && draft.createdExpenseId) {
    return {
      text:
        '✅ Chi tiêu này đã được thêm trước đó.\n\n' +
        `Mã giao dịch: <code>${draft.createdExpenseId}</code>`,
      parseMode: 'HTML',
      replyMarkup: expenseCreatedKeyboard(draft.createdExpenseId),
    }
  }

  // Atomically claim the draft (CAS — HIGH 3). Only one concurrent caller succeeds.
  const claimed = await claimDraftForConfirm(db, draft.id)

  if (!claimed) {
    // Another request claimed it first — re-read to see if it's confirmed
    const updatedDraft = await findDraftById(db, draft.id)

    if (updatedDraft?.status === 'confirmed' && updatedDraft.createdExpenseId) {
      return {
        text:
          '✅ Chi tiêu này đã được thêm trước đó.\n\n' +
          `Mã giao dịch: <code>${updatedDraft.createdExpenseId}</code>`,
        parseMode: 'HTML',
        replyMarkup: expenseCreatedKeyboard(updatedDraft.createdExpenseId),
      }
    }

    return {
      text: 'Yêu cầu thêm chi tiêu này đã được xử lý. Vui lòng thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Parse the preview
  let preview: PreviewData

  try {
    preview = JSON.parse(draft.previewJson) as PreviewData
  } catch {
    return {
      text: 'Dữ liệu xem trước không hợp lệ. Vui lòng thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Defense-in-depth: verify household membership for household scope
  if (preview.scope === 'household' && preview.householdId) {
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

    if (!householdIds.includes(preview.householdId)) {
      return {
        text: 'Bạn không có quyền thêm chi tiêu vào hộ gia đình này.',
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
    text: renderConfirmSuccessText(preview, currencyCode),
    parseMode: 'HTML',
    replyMarkup: expenseCreatedKeyboard(expense.id),
  }
}

/**
 * Handle a cancel expense action. Marks draft cancelled.
 */
export const handleCancelExpense = async (
  ctx: CommandContext,
  draftId: string,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
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
    text: 'Đã hủy thêm chi tiêu.',
    parseMode: 'HTML',
  }
}

/**
 * Handle a retry action — just tells user to send a new /ai command.
 */
export const handleRetryExpense = async (
  _ctx: CommandContext,
  _draftId: string,
): Promise<BotResponse> => ({
  text:
    'Vui lòng gửi lại nội dung chi tiêu bằng lệnh /ai.\n\n' +
    'Ví dụ: <code>/ai ăn bún 30k 15/6</code>',
  parseMode: 'HTML',
})
