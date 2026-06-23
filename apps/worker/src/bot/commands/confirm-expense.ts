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
import {
  expenseCreatedKeyboard,
  expensePreviewKeyboard,
  householdSelectKeyboard,
  openAppKeyboard,
} from '../renderers/keyboards'
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
    return buildAlreadyCreatedResponse(ctx, draft.createdExpenseId)
  }

  // Atomically claim the draft (CAS — HIGH 3). Only one concurrent caller succeeds.
  const claimed = await claimDraftForConfirm(db, draft.id)

  if (!claimed) {
    // Another request claimed it first — re-read to see if it's confirmed
    const updatedDraft = await findDraftById(db, draft.id)

    if (updatedDraft?.status === 'confirmed' && updatedDraft.createdExpenseId) {
      return buildAlreadyCreatedResponse(ctx, updatedDraft.createdExpenseId)
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

const buildAlreadyCreatedResponse = (
  _ctx: CommandContext,
  expenseId: string,
): BotResponse => ({
  text:
    '✅ Chi tiêu này đã được thêm trước đó.\n\n' +
    `Mã giao dịch: <code>${expenseId}</code>`,
  parseMode: 'HTML',
  replyMarkup: expenseCreatedKeyboard(expenseId),
})

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
 * Handle a household select action.
 *
 * Two modes:
 * 1. `household:draftId` (payload empty) — show household selection keyboard
 * 2. `hhselect:draftId:personal|householdId` (payload set) — apply selection, re-render preview
 *
 * Verifies membership before setting household scope.
 */
export const handleHouseholdSelect = async (
  ctx: CommandContext,
  draftId: string,
  householdIdOrPersonal: string,
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

  if (!draft || draft.status !== 'pending') {
    return {
      text: 'Không tìm thấy yêu cầu hoặc đã hết hạn. Vui lòng thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Mode 1: No payload — show household selection keyboard
  if (!householdIdOrPersonal) {
    return buildHouseholdSelection(ctx, db, draft)
  }

  // Mode 2: Apply selection
  let preview: PreviewData

  try {
    preview = JSON.parse(draft.previewJson) as PreviewData
  } catch {
    return {
      text: 'Dữ liệu xem trước không hợp lệ.',
      parseMode: 'HTML',
    }
  }

  if (householdIdOrPersonal === 'personal') {
    preview.scope = 'personal'
    preview.householdId = undefined
    preview.householdName = undefined
  } else {
    // Verify membership before setting household scope
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

    if (!householdIds.includes(householdIdOrPersonal)) {
      return {
        text: 'Bạn không có quyền chọn hộ gia đình này.',
        parseMode: 'HTML',
      }
    }

    const household = await findHouseholdById(db, householdIdOrPersonal)
    if (!household) {
      return {
        text: 'Không tìm thấy hộ gia đình.',
        parseMode: 'HTML',
      }
    }
    preview.scope = 'household'
    preview.householdId = household.id
    preview.householdName = household.name
  }

  // Update the draft with new preview
  const { upsertDraft } =
    await import('@/db/repositories/telegram-bot-expense-draft-repository')
  const { renderExpensePreviewText } = await import('../renderers/finance-text')

  await upsertDraft(db, {
    telegramUserId: draft.telegramUserId,
    telegramChatId: draft.telegramChatId,
    dedupeKey: draft.dedupeKey,
    previewJson: JSON.stringify(preview),
    locale: draft.locale,
  }).catch(() => {})

  return {
    text: renderExpensePreviewText(
      preview,
      preview.scope === 'household' && preview.householdId
        ? ((await findHouseholdById(db, preview.householdId))
            ?.defaultCurrencyCode ?? 'VND')
        : 'VND',
    ),
    parseMode: 'HTML',
    replyMarkup: expensePreviewKeyboard(draft.id),
  }
}

/**
 * Build a household selection message with inline keyboard.
 * Queries user's active households and renders the selection keyboard.
 */
const buildHouseholdSelection = async (
  ctx: CommandContext,
  db: D1Database,
  draft: { id: string },
): Promise<BotResponse> => {
  const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId!)

  if (householdIds.length === 0) {
    return {
      text: 'Bạn chưa tham gia hộ gia đình nào. Chi tiêu sẽ được thêm ở phạm vi cá nhân.',
      parseMode: 'HTML',
    }
  }

  const households: Array<{ id: string; name: string }> = []

  for (const hhId of householdIds) {
    const hh = await findHouseholdById(db, hhId)
    if (hh) {
      households.push({ id: hh.id, name: hh.name })
    }
  }

  return {
    text: 'Chọn phạm vi cho chi tiêu này:',
    parseMode: 'HTML',
    replyMarkup: householdSelectKeyboard(draft.id, households),
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
