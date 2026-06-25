/**
 * Post-create handler: soft-delete the expense (1-tap undo) (feat-121).
 *
 * Verifies ownership, soft-deletes via the standard expense repo,
 * writes an audit log, and edits the message in place to
 * `🗑 Đã xoá — <summary>` with no inline buttons.
 *
 * Defense in depth: re-loads the expense and verifies
 * `spent_by_user_id === ctx.appUserId` before deleting. The service
 * layer (callback-dispatcher) already filters unlinked users, but the
 * extra check protects against a stale link race.
 */
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findExpenseByIdRaw,
  softDeleteExpense,
} from '@/db/repositories/expense-repository'

import { renderExpenseSummaryLine } from '../format'
import type { BotResponse, CommandContext } from '../types'
import { formatDateOnly } from './post-create-shared'

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
