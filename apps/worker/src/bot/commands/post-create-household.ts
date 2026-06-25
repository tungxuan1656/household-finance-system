/**
 * Post-create handler: tap on `🏠 Chọn gia đình` (feat-121).
 *
 * Edits the per-expense message to a compact summary + "Chọn phạm vi:"
 * + household picker keyboard. The picker uses
 * `ch_apply:<expenseId>:<hhId|personal>` callbacks that hit the apply
 * handler.
 *
 * Defense in depth: re-loads the expense and verifies
 * `spent_by_user_id === ctx.appUserId` before rendering. The service
 * layer (callback-dispatcher) already filters unlinked users, but the
 * extra check protects against a stale link race.
 */
import { findExpenseByIdRaw } from '@/db/repositories/expense-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'

import { renderExpenseSummaryLine } from '../format'
import { type householdSelectKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'
import { formatDateOnly } from './post-create-shared'

export const handlePostCreateHousehold = async (
  ctx: CommandContext,
  expenseId: string,
  messageId?: number,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Phiên đã hết. Mở Mini App để đăng nhập lại.',
      parseMode: 'HTML',
    }
  }

  const db = ctx.db
  const expense = await findExpenseByIdRaw(db, expenseId)

  if (!expense || expense.spentByUserId !== ctx.appUserId) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Không tìm thấy chi tiêu hoặc đã bị xoá.',
      parseMode: 'HTML',
    }
  }

  // Re-render the summary line from the live row so the picker shows the
  // current scope / amount / category (not a stale snapshot).
  const summary = renderExpenseSummaryLine({
    amountMinor: expense.amountMinor,
    occurredAt: formatDateOnly(expense.occurredAt),
    categoryKey: expense.categoryKey,
    title: expense.title,
    sourceKey: expense.sourceKey,
    scope: expense.householdId ? 'household' : 'personal',
    currencyCode: expense.currencyCode,
  })

  const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

  if (householdIds.length === 0) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: `${summary}\n\nChưa tham gia hộ nào. Sẽ giữ ở cá nhân.`,
      parseMode: 'HTML',
    }
  }

  const households: Array<{ id: string; name: string }> = []

  for (const hhId of householdIds) {
    const hh = await findHouseholdById(db, hhId)
    if (hh) households.push({ id: hh.id, name: hh.name })
  }

  return {
    mode: 'edit',
    targetMessageId: messageId,
    text: `${summary}\n\nChọn phạm vi:`,
    parseMode: 'HTML',
    replyMarkup: postCreateHouseholdPickerKeyboard(expenseId, households),
  }
}

/**
 * Build a picker keyboard for the post-create household flow. Re-uses
 * the visual layout of `householdSelectKeyboard` but routes taps to
 * `ch_apply:<expenseId>:<hhId|personal>` instead of the draft-flow
 * `hhselect:<draftId>:<hhId|personal>` callback.
 */
const postCreateHouseholdPickerKeyboard = (
  expenseId: string,
  households: Array<{ id: string; name: string }>,
): ReturnType<typeof householdSelectKeyboard> => ({
  inline_keyboard: [
    [
      {
        text: '👤 Cá nhân',
        callback_data: `ch_apply:${expenseId}:personal`,
      },
    ],
    ...households.map((h) => [
      {
        text: `🏠 ${h.name}`,
        callback_data: `ch_apply:${expenseId}:${h.id}`,
      },
    ]),
  ],
})
