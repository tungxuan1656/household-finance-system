/**
 * Post-create handler: apply a household pick (or pick "personal") (feat-121).
 *
 * Verifies ownership, verifies household membership when applicable,
 * updates the expense, writes an audit log, and edits the message to
 * the post-reassignment state.
 *
 * Defense in depth: re-loads the expense and verifies
 * `spent_by_user_id === ctx.appUserId` before writing. The service
 * layer (callback-dispatcher) already filters unlinked users, but the
 * extra check protects against a stale link race.
 */
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findExpenseByIdRaw,
  updateExpenseHousehold,
} from '@/db/repositories/expense-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'

import { renderExpensePreviewText, renderExpenseSummaryLine } from '../format'
import { postCreateKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'
import { formatDateOnly } from './post-create-shared'

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
    householdName = household.name
    // Bot natural-input expenses are always stored in VND minor units
    // (see natural-expense.ts:155: getMinorUnits(amountVnd, 'VND')).
    // Without an FX rate we cannot safely convert amount_minor to a
    // non-VND currency, so the expense stays in VND regardless of the
    // household's default. Household defaults only affect analytics for
    // entries created in that currency elsewhere (TMA, web).
    targetCurrency = 'VND'
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
