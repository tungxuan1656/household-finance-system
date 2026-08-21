/**
 * Natural-input expense direct-create flow (feat-121).
 *
 * Unlike `/add`, the natural (non-command) chat path skips
 * the preview/confirm step. When the amount detector + AI parser produce
 * at least one valid expense, the bot creates each expense immediately
 * and sends one Telegram message per created expense. Each message carries
 * a `postCreateKeyboard` (`🏠 Chọn gia đình`) so the user can reassign
 * a freshly-created personal expense to a household with 1 tap.
 *
 * No dedupe. No drafts. No scope-arg resolution. The default scope is
 * personal — the user reassigns household through the post-create button
 * when needed.
 */
import {
  AI_UNAVAILABLE_TEXT,
  INPUT_UNRECOGNIZED_TEXT,
  LOADER_TEXT,
  renderExpenseSummaryLine,
} from '@/bot/format'
import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import { replaceExpenseGroupAssignments } from '@/db/repositories/expense-group-assignment-repository'
import {
  createExpense,
  type CreateExpenseInput,
} from '@/db/repositories/expense-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import {
  fetchAiContext,
  mapAiNamesToIds,
} from '@/handlers/expenses/parse-expense'
import {
  AiUpstreamError,
  parseExpensesWithAi,
  type RawAiItem,
} from '@/lib/ai/expense-parser'
import { getMinorUnits } from '@/lib/currency'
import { logger, truncateErrorMessage } from '@/lib/logger'
import { newId } from '@/utils/id'

import type { BotServiceDeps } from '../callback-dispatcher'
import { buildCtx } from '../callback-dispatcher'
import { detectAmountInVnd, looksLikeExpense } from '../lib/vn-amount-detector'
import { postCreateKeyboard } from '../renderers/keyboards'
import { type TelegramClient } from '../telegram-client'
import type { TelegramMessage, TelegramUser } from '../types'
import { normalizeAiItem } from './ai-expense-shared'

/**
 * Run the natural-input direct-create flow for a single private chat
 * message. Returns the number of Telegram messages the bot sent
 * (1 loader + N per-expense messages). Returns 0 when the message is
 * not a natural expense, the user is unlinked, or the AI cannot parse
 * a single valid item — the caller should treat 0 as "not handled".
 */
export const runNaturalExpenseCreate = async (
  deps: BotServiceDeps,
  client: TelegramClient,
  message: TelegramMessage & { from: TelegramUser },
  appUserId: string,
): Promise<number> => {
  const text = (message.text ?? '').trim()

  if (!looksLikeExpense(text)) return 0

  const amountResult = detectAmountInVnd(text)

  if (!amountResult) return 0

  if (
    !deps.env?.OPENAI_COMPAT_BASE_URL ||
    !deps.env?.OPENAI_COMPAT_API_KEY ||
    !deps.env?.OPENAI_COMPAT_MODEL
  ) {
    return 0
  }

  const loaderMsgId = await client.sendMessage(message.chat.id, LOADER_TEXT)

  const defaultDate = new Date().toISOString().slice(0, 10)
  const correlationId = newId()

  logger.info(correlationId, 'bot_natural_expense_start', {
    textChars: text.length,
    messageId: message.message_id,
    chatId: message.chat.id,
    appUserId,
  })

  // Fetch whitelist context for AI prompt (reuse feat-130)
  let aiContext: Awaited<ReturnType<typeof fetchAiContext>> | null = null
  let promptContext:
    | {
        households: { id: string; name: string }[]
        groups: { id: string; name: string; householdId?: string | null }[]
      }
    | undefined
  try {
    const fetched = await fetchAiContext(deps.db, appUserId, correlationId)
    aiContext = fetched

    promptContext = {
      households: fetched.availableHouseholds,
      groups: fetched.availableGroups,
    }

    logger.info(correlationId, 'bot_natural_context_fetched', {
      textChars: text.length,
      householdCount: fetched.availableHouseholds.length,
      groupCount: fetched.availableGroups.length,
    })
  } catch {
    promptContext = undefined
  }

  let rawItems: RawAiItem[]

  try {
    rawItems = await parseExpensesWithAi(
      text,
      {
        baseUrl: deps.env.OPENAI_COMPAT_BASE_URL,
        apiKey: deps.env.OPENAI_COMPAT_API_KEY,
        model: deps.env.OPENAI_COMPAT_MODEL,
      },
      { defaultOccurredAt: defaultDate, correlationId, context: promptContext },
    )

    logger.info(correlationId, 'bot_natural_expense_ai_success', {
      textChars: text.length,
      rawItemsCount: rawItems.length,
    })
  } catch (error) {
    if (error instanceof AiUpstreamError) {
      logger.error(correlationId, 'bot_natural_expense_ai_upstream_failure', {
        textChars: text.length,
      })

      await client.editMessageText(
        message.chat.id,
        loaderMsgId,
        AI_UNAVAILABLE_TEXT,
        {
          parseMode: 'HTML',
        },
      )
    } else {
      logger.error(correlationId, 'bot_natural_expense_ai_error', {
        textChars: text.length,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage:
          error instanceof Error
            ? truncateErrorMessage(error.message)
            : truncateErrorMessage(String(error)),
      })

      await client.editMessageText(
        message.chat.id,
        loaderMsgId,
        AI_UNAVAILABLE_TEXT,
        {
          parseMode: 'HTML',
        },
      )
    }

    return 1
  }

  // Build a validated item list. For single-item natural input we trust the
  // detector for the amount (override AI's amount with it) and use the AI for
  // the other fields. For multi-item natural input the detector only proves the
  // message contains an expense-like amount, so each created expense must keep
  // its own AI-parsed amount. Also map householdName/groupNames via whitelist.
  const validItems: ParsedExpenseItem[] = []
  const aiMappings: Array<{ householdId: string | null; groupIds: string[] }> =
    []
  const counters = { mappedHouseholdCount: 0, mappedGroupCount: 0 }
  const maps = aiContext
    ? {
        householdNameToId: aiContext.householdNameToId,
        groupNameToId: aiContext.groupNameToId,
      }
    : {
        householdNameToId: new Map<string, string>(),
        groupNameToId: new Map<string, string>(),
      }

  for (const raw of rawItems) {
    const { householdId, groupIds } = aiContext
      ? mapAiNamesToIds(raw as RawAiItem, maps, counters)
      : { householdId: null as string | null, groupIds: [] as string[] }
    const normalized = normalizeAiItem(raw, defaultDate)
    if (normalized) {
      validItems.push(normalized)
      aiMappings.push({ householdId, groupIds })
    }
  }

  if (aiContext) {
    logger.info(correlationId, 'bot_natural_mapping', {
      textChars: text.length,
      rawItemsCount: rawItems.length,
      validItemsCount: validItems.length,
      mappedHouseholdCount: counters.mappedHouseholdCount,
      mappedGroupCount: counters.mappedGroupCount,
    })
  }

  if (validItems.length === 0) {
    await client.editMessageText(
      message.chat.id,
      loaderMsgId,
      INPUT_UNRECOGNIZED_TEXT,
      { parseMode: 'HTML' },
    )

    return 1
  }

  // Does the user have any households? If yes, show the household button
  // on every per-expense message; otherwise hide it.
  const householdIds = await listActiveHouseholdIdsForUser(deps.db, appUserId)
  const hasHouseholds = householdIds.length > 0

  const ctx = buildCtx({
    userId: message.from.id,
    chatId: message.chat.id,
    text,
    appUserId,
    deps,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    languageCode: message.from.language_code,
  })

  // Create the expenses, capture ids, build the per-expense messages.
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
      const expense = await createExpense(deps.db, input)

      if (mapping.groupIds.length > 0) {
        await replaceExpenseGroupAssignments(
          deps.db,
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

      // Audit log — natural input write (used by the post-create handlers
      // to attribute delete/household-change events to the same source).
      await createAuditLogEntry(deps.db, {
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

      const summary = renderExpenseSummaryLine({
        amountMinor,
        occurredAt: item.occurredAt,
        categoryKey: item.categoryKey,
        title: item.title,
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

  if (created.length === 0) {
    await client.editMessageText(
      message.chat.id,
      loaderMsgId,
      INPUT_UNRECOGNIZED_TEXT,
      { parseMode: 'HTML' },
    )

    return 1
  }

  // First expense: edit the loader message in place to its summary + buttons.
  const first = created[0]!

  await client.editMessageText(
    message.chat.id,
    loaderMsgId,
    `✅ ${first.summary}`,
    {
      parseMode: 'HTML',
      replyMarkup: postCreateKeyboard(first.expenseId, hasHouseholds),
    },
  )

  // Remaining expenses: send one Telegram message per expense.
  for (let i = 1; i < created.length; i++) {
    const item = created[i]!

    await client.sendMessage(message.chat.id, `✅ ${item.summary}`, {
      parseMode: 'HTML',
      replyMarkup: postCreateKeyboard(item.expenseId, hasHouseholds),
    })
  }

  // ctx is built above for consistency with the rest of the bot code;
  // a future slice may need it for rate limiting / locale-specific copy.
  void ctx

  return 1 + (created.length - 1)
}
