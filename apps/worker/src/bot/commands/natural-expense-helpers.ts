import { renderExpenseSummaryLine } from '@/bot/format'
import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import { replaceExpenseGroupAssignments } from '@/db/repositories/expense-group-assignment-repository'
import {
  createExpense,
  type CreateExpenseInput,
} from '@/db/repositories/expense-repository'
import type { RawAiItem } from '@/lib/ai/expense-parser'
import { mapAiNamesToIds } from '@/lib/ai/household-context'
import { getMinorUnits } from '@/lib/currency'
import { logger, truncateErrorMessage } from '@/lib/logger'
import { newId } from '@/utils/id'

import type { TelegramClient } from '../telegram-client'
import { normalizeAiItem } from './ai-expense-shared'

export const normalizeNaturalItems = (
  rawItems: RawAiItem[],
  aiContext: {
    householdNameToId: Map<string, string>
    groupNameToId: Map<string, string>
    groupIdToHouseholdId: Map<string, string | null>
  } | null,
  defaultDate: string,
): {
  validItems: ParsedExpenseItem[]
  aiMappings: Array<{ householdId: string | null; groupIds: string[] }>
  counters: { mappedHouseholdCount: number; mappedGroupCount: number }
} => {
  const validItems: ParsedExpenseItem[] = []
  const aiMappings: Array<{ householdId: string | null; groupIds: string[] }> =
    []
  const counters = { mappedHouseholdCount: 0, mappedGroupCount: 0 }
  const maps = aiContext
    ? {
        householdNameToId: aiContext.householdNameToId,
        groupNameToId: aiContext.groupNameToId,
        groupIdToHouseholdId: aiContext.groupIdToHouseholdId,
      }
    : {
        householdNameToId: new Map<string, string>(),
        groupNameToId: new Map<string, string>(),
        groupIdToHouseholdId: new Map<string, string | null>(),
      }

  for (const raw of rawItems) {
    const { householdId, groupIds } = aiContext
      ? mapAiNamesToIds(raw as RawAiItem, maps, counters, {
          filterGroupByHousehold: true,
        })
      : { householdId: null as string | null, groupIds: [] as string[] }
    const normalized = normalizeAiItem(raw, defaultDate)
    if (normalized) {
      validItems.push(normalized)
      aiMappings.push({ householdId, groupIds })
    }
  }

  return { validItems, aiMappings, counters }
}

export const createNaturalExpenses = async (params: {
  db: D1Database
  appUserId: string
  validItems: ParsedExpenseItem[]
  aiMappings: Array<{ householdId: string | null; groupIds: string[] }>
  amountResult: { amountVnd: number; matched: string }
  correlationId: string
  text: string
}): Promise<
  Array<{ expenseId: string; summary: string; input: CreateExpenseInput }>
> => {
  const {
    db,
    appUserId,
    validItems,
    aiMappings,
    amountResult,
    correlationId,
    text,
  } = params
  const created: Array<{
    expenseId: string
    summary: string
    input: CreateExpenseInput
  }> = []

  for (let idx = 0; idx < validItems.length; idx++) {
    const item = validItems[idx]!
    const mapping = aiMappings[idx] ?? { householdId: null, groupIds: [] }
    const amountVnd =
      validItems.length === 1 ? amountResult.amountVnd : item.amount
    const amountMinor = getMinorUnits(amountVnd, 'VND')
    const occurredAtMs = Date.parse(item.occurredAt)
    const resolvedHouseholdId = mapping.householdId

    const input: CreateExpenseInput = {
      id: newId(),
      householdId: resolvedHouseholdId,
      spentByUserId: appUserId,
      categoryKey: item.categoryKey,
      sourceKey: item.sourceKey,
      amountMinor,
      currencyCode: 'VND',
      occurredAt: occurredAtMs,
      title: item.title,
      note: 'Tạo qua Telegram bot',
      createdViaBot: 1,
    }

    try {
      const expense = await createExpense(db, input)

      if (mapping.groupIds.length > 0) {
        await replaceExpenseGroupAssignments(
          db,
          expense.id,
          mapping.groupIds,
          appUserId,
        ).catch((err: unknown) => {
          logger.error(correlationId, 'natural_expense_group_assign_failed', {
            error:
              err instanceof Error
                ? truncateErrorMessage(err.message)
                : truncateErrorMessage(String(err)),
          })
        })
      }

      // Audit log — natural input write
      await createAuditLogEntry(db, {
        householdId: resolvedHouseholdId,
        actorUserId: appUserId,
        actionType: 'expense.created',
        targetType: 'expense',
        targetId: expense.id,
        payloadJson: JSON.stringify({
          source: 'telegram_bot',
          expenseId: expense.id,
          naturalInput: true,
          rawText: text,
          householdId: resolvedHouseholdId,
          groupIds: mapping.groupIds,
        }),
      }).catch((err: unknown) => {
        logger.error(correlationId, 'natural_expense_audit_log_failed', {
          error:
            err instanceof Error
              ? truncateErrorMessage(err.message)
              : truncateErrorMessage(String(err)),
        })
      })

      // Truncate title 60 chars for summary line to keep single message bounded
      const truncatedTitle =
        item.title.length > 60 ? item.title.slice(0, 60) + '…' : item.title

      const summary = renderExpenseSummaryLine({
        amountMinor,
        occurredAt: item.occurredAt,
        categoryKey: item.categoryKey,
        title: truncatedTitle,
        sourceKey: item.sourceKey,
        scope: resolvedHouseholdId ? 'household' : 'personal',
        currencyCode: 'VND',
        ...(resolvedHouseholdId ? { householdId: resolvedHouseholdId } : {}),
        ...(mapping.groupIds.length > 0 ? { groupIds: mapping.groupIds } : {}),
      })

      created.push({ expenseId: expense.id, summary, input })
    } catch (err) {
      logger.error(correlationId, 'natural_expense_create_failed', {
        error:
          err instanceof Error
            ? truncateErrorMessage(err.message)
            : truncateErrorMessage(String(err)),
      })
    }
  }

  return created
}

export const sendPostCreateMessages = async (
  client: TelegramClient,
  chatId: number,
  loaderMsgId: number,
  created: Array<{ expenseId: string; summary: string }>,
  truncatedNote = '',
): Promise<void> => {
  const lines = created.map((e, i) => `${i + 1}. ${e.summary}`).join('\n')
  let text = `✅ Đã thêm ${created.length} khoản:\n${lines}${truncatedNote}`

  // Cap 4096 chars with ellipsis
  if (text.length > 4096) {
    text = text.slice(0, 4095) + '…'
  }

  // Stacked delete keyboards (one per expense, no household button)
  const inline_keyboard = created.map((e) => [
    { text: '🗑 Xoá', callback_data: `ch_delete:${e.expenseId}` },
  ])

  await client.editMessageText(chatId, loaderMsgId, text, {
    parseMode: 'HTML',
    replyMarkup: inline_keyboard.length > 0 ? { inline_keyboard } : undefined,
  })
}
