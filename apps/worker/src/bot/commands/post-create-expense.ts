/**
 * Post-create handlers for the natural-input direct-create flow (feat-121).
 *
 * Three callback actions:
 * - `ch_household:<expenseId>`  — show the household picker (no DB write)
 * - `ch_apply:<expenseId>:<hhId|personal>` — apply the household pick
 * - `ch_delete:<expenseId>`    — soft-delete the expense
 *
 * All three edit the original per-expense message in place. They never
 * send a new bubble. The handlers are read-modify-write on the inline
 * keyboard: pickers do not persist a state row, so re-tapping
 * `🏠 Chọn gia đình` re-renders the picker fresh.
 *
 * Defense in depth: every mutating handler re-loads the expense and
 * verifies `spent_by_user_id === ctx.appUserId` before writing. The
 * service layer (callback-dispatcher) already filters unlinked users,
 * but the extra check protects against a stale link race.
 */
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findExpenseByIdRaw,
  softDeleteExpense,
  updateExpenseHousehold,
} from '@/db/repositories/expense-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'

import { renderExpensePreviewText, renderExpenseSummaryLine } from '../format'
import {
  type householdSelectKeyboard,
  postCreateKeyboard,
} from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

/**
 * Tap on `🏠 Chọn gia đình`. Edits the per-expense message to a
 * compact summary + "Chọn phạm vi:" + household picker keyboard.
 * The picker uses `ch_apply:<expenseId>:<hhId>` callbacks that hit
 * the apply handler below.
 */
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
 * Apply a household pick (or pick "personal"). Verifies ownership,
 * verifies household membership when applicable, updates the expense,
 * and edits the message to the post-reassignment state.
 */
export const handlePostCreateApply = async (
  ctx: CommandContext,
  expenseId: string,
  householdIdOrPersonal: string,
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

  // Determine target household + currency. For 'personal' we reset both
  // household_id and currency_code to VND. For an hhId we verify membership
  // and look up the household's default currency.
  let targetHouseholdId: string | null = null
  let targetCurrency = 'VND'
  let householdName: string | undefined

  if (householdIdOrPersonal === 'personal') {
    // no-op-safe: keep current personal state
  } else {
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

    if (!householdIds.includes(householdIdOrPersonal)) {
      return {
        mode: 'edit',
        targetMessageId: messageId,
        text: 'Không có quyền chọn hộ này.',
        parseMode: 'HTML',
      }
    }

    const household = await findHouseholdById(db, householdIdOrPersonal)

    if (!household) {
      return {
        mode: 'edit',
        targetMessageId: messageId,
        text: 'Không tìm thấy hộ.',
        parseMode: 'HTML',
      }
    }

    targetHouseholdId = household.id
    targetCurrency = household.defaultCurrencyCode ?? 'VND'
    householdName = household.name
  }

  const updated = await updateExpenseHousehold(
    db,
    expenseId,
    targetHouseholdId,
    targetCurrency,
  )

  if (!updated) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Không cập nhật được. Thử lại.',
      parseMode: 'HTML',
    }
  }

  // Audit the household change. naturalInput flag distinguishes this
  // from TMA / web app expense edits in the audit log.
  await createAuditLogEntry(db, {
    householdId: targetHouseholdId,
    actorUserId: ctx.appUserId,
    actionType: 'expense.updated',
    targetType: 'expense',
    targetId: expenseId,
    payloadJson: JSON.stringify({
      source: 'telegram_bot',
      expenseId,
      naturalInput: true,
      field: 'household_id',
      previousHouseholdId: expense.householdId,
      nextHouseholdId: targetHouseholdId,
    }),
  }).catch((err: unknown) => {
    console.error('post-create-apply: audit log write failed', err)
  })

  // Personal pick → restore the original ✅ summary + both buttons.
  if (!targetHouseholdId) {
    const summary = renderExpenseSummaryLine({
      amountMinor: updated.amountMinor,
      occurredAt: formatDateOnly(updated.occurredAt),
      categoryKey: updated.categoryKey,
      title: updated.title,
      sourceKey: updated.sourceKey,
      scope: 'personal',
      currencyCode: 'VND',
    })

    // hasHouseholds: the picker only opened because the user has at
    // least one household, so the household button is still relevant.
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: `✅ ${summary}`,
      parseMode: 'HTML',
      replyMarkup: postCreateKeyboard(expenseId, true),
    }
  }

  // Household pick → show the full preview with the household name in
  // place of "Cá nhân". After reassignment we hide the household button
  // (the user is already in a household; tapping again would only switch).
  const text = renderExpensePreviewText({
    amountMinor: updated.amountMinor,
    occurredAt: formatDateOnly(updated.occurredAt),
    categoryKey: updated.categoryKey,
    title: updated.title,
    sourceKey: updated.sourceKey,
    scope: 'household',
    householdId: updated.householdId ?? undefined,
    householdName,
    currencyCode: updated.currencyCode,
  })

  return {
    mode: 'edit',
    targetMessageId: messageId,
    text: `✅ ${text}`,
    parseMode: 'HTML',
    replyMarkup: postCreateKeyboard(expenseId, true),
  }
}

/**
 * Soft-delete the expense (1-tap undo for the natural-input direct-create
 * flow). Verifies ownership, soft-deletes via the standard expense repo,
 * writes an audit log, and edits the message in place to
 * `🗑 Đã xoá — <summary>` with no inline buttons.
 */
export const handlePostCreateDelete = async (
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

  // Capture summary text BEFORE soft-delete so we can render the
  // "Đã xoá — <summary>" line.
  const summary = renderExpenseSummaryLine({
    amountMinor: expense.amountMinor,
    occurredAt: formatDateOnly(expense.occurredAt),
    categoryKey: expense.categoryKey,
    title: expense.title,
    sourceKey: expense.sourceKey,
    scope: expense.householdId ? 'household' : 'personal',
    currencyCode: expense.currencyCode,
  })

  const ok = await softDeleteExpense(db, expenseId)

  if (!ok) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Không xoá được. Thử lại.',
      parseMode: 'HTML',
    }
  }

  await createAuditLogEntry(db, {
    householdId: expense.householdId,
    actorUserId: ctx.appUserId,
    actionType: 'expense.deleted',
    targetType: 'expense',
    targetId: expenseId,
    payloadJson: JSON.stringify({
      source: 'telegram_bot',
      expenseId,
      naturalInputUndo: true,
    }),
  }).catch((err: unknown) => {
    console.error('post-create-delete: audit log write failed', err)
  })

  return {
    mode: 'edit',
    targetMessageId: messageId,
    text: `🗑 Đã xoá — ${summary}`,
    parseMode: 'HTML',
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

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

/**
 * Format a millisecond epoch as `YYYY-MM-DD` for the renderers. Mirrors
 * what the /ai preview path does, so the post-create summary line uses
 * the same date format the user saw during preview.
 */
const formatDateOnly = (epochMs: number): string => {
  const d = new Date(epochMs)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}
