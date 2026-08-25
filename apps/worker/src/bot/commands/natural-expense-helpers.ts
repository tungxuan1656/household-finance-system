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

export const createSafeEdit =
  (client: TelegramClient, correlationId: string) =>
  async (
    chatId: number | string,
    msgId: number,
    editText: string,
  ): Promise<void> => {
    try {
      await client.editMessageText(chatId, msgId, editText, {
        parseMode: 'HTML',
      })

      return
    } catch (firstError) {
      logger.error(
        correlationId,
        'bot_natural_expense_safe_edit_first_failed',
        {
          chatId,
          msgId,
          errorName:
            firstError instanceof Error ? firstError.name : 'UnknownError',
          errorMessage:
            firstError instanceof Error
              ? truncateErrorMessage(firstError.message)
              : truncateErrorMessage(String(firstError)),
        },
      )

      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      try {
        await client.editMessageText(chatId, msgId, editText, {
          parseMode: 'HTML',
        })

        return
      } catch (secondError) {
        logger.error(
          correlationId,
          'bot_natural_expense_safe_edit_retry_failed',
          {
            chatId,
            msgId,
            errorName:
              secondError instanceof Error ? secondError.name : 'UnknownError',
            errorMessage:
              secondError instanceof Error
                ? truncateErrorMessage(secondError.message)
                : truncateErrorMessage(String(secondError)),
          },
        )

        try {
          await client.sendMessage(chatId, editText, { parseMode: 'HTML' })
        } catch (sendError) {
          logger.error(
            correlationId,
            'bot_natural_expense_safe_edit_fallback_send_failed',
            {
              chatId,
              errorName:
                sendError instanceof Error ? sendError.name : 'UnknownError',
              errorMessage:
                sendError instanceof Error
                  ? truncateErrorMessage(sendError.message)
                  : truncateErrorMessage(String(sendError)),
            },
          )
        }
      }
    }
  }

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
  householdNameById?: Map<string, string>
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

      const householdName = resolvedHouseholdId
        ? params.householdNameById?.get(resolvedHouseholdId)
        : undefined

      const summary = renderExpenseSummaryLine({
        amountMinor,
        occurredAt: item.occurredAt,
        categoryKey: item.categoryKey,
        title: truncatedTitle,
        sourceKey: item.sourceKey,
        scope: resolvedHouseholdId ? 'household' : 'personal',
        currencyCode: 'VND',
        ...(resolvedHouseholdId ? { householdId: resolvedHouseholdId } : {}),
        ...(householdName ? { householdName } : {}),
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

  // Cap 4096 without splitting HTML entity
  if (text.length > 4096) {
    let cut = 4095
    // back off low surrogates so we never split an emoji pair (e.g. 🏠 U+1F3E0)
    while (
      cut > 0 &&
      text.charCodeAt(cut) >= 0xdc00 &&
      text.charCodeAt(cut) <= 0xdfff
    ) {
      cut--
    }

    const lastAmp = text.lastIndexOf('&', cut)
    if (lastAmp !== -1 && lastAmp > cut - 10) {
      const semi = text.indexOf(';', lastAmp)
      if (semi === -1 || semi > cut) cut = lastAmp
    }
    text = text.slice(0, cut) + '…'
  }

  await client.editMessageText(chatId, loaderMsgId, text, {
    parseMode: 'HTML',
  })
}
