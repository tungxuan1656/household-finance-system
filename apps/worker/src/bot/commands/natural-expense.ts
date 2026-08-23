/**
 * Natural-input expense direct-create flow (feat-121, feat-135).
 *
 * Direct-create: loader -> single grouped summary edit. Batch capped to 10.
 */
import {
  AI_UNAVAILABLE_TEXT,
  INPUT_UNRECOGNIZED_TEXT,
  LOADER_TEXT,
} from '@/bot/format'
import {
  AiUpstreamError,
  parseExpensesWithAi,
  type RawAiItem,
} from '@/lib/ai/expense-parser'
import { fetchAiContext } from '@/lib/ai/household-context'
import { DEFAULT_AI_TIMEOUT_MS, getAiTimeoutMs } from '@/lib/env'
import { logger, truncateErrorMessage } from '@/lib/logger'
import { newId } from '@/utils/id'

import type { BotServiceDeps } from '../callback-dispatcher'
import { buildCtx } from '../callback-dispatcher'
import { detectAmountInVnd, looksLikeExpense } from '../lib/vn-amount-detector'
import { type TelegramClient } from '../telegram-client'
import type { TelegramMessage, TelegramUser } from '../types'
import {
  createNaturalExpenses,
  normalizeNaturalItems,
  sendPostCreateMessages,
} from './natural-expense-helpers'

/**
 * Run the natural-input direct-create flow for a single private chat
 * message. Returns 1 when handled (single loader edit), 0 otherwise.
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
  const timeoutMs = getAiTimeoutMs(
    deps.env as unknown as Env,
    DEFAULT_AI_TIMEOUT_MS,
  )

  try {
    rawItems = await parseExpensesWithAi(
      text,
      {
        baseUrl: deps.env.OPENAI_COMPAT_BASE_URL,
        apiKey: deps.env.OPENAI_COMPAT_API_KEY,
        model: deps.env.OPENAI_COMPAT_MODEL,
        timeoutMs,
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

  // Cap batch to 10 with truncated note
  const truncatedCount = rawItems.length > 10 ? rawItems.length - 10 : 0
  const cappedRawItems = truncatedCount > 0 ? rawItems.slice(0, 10) : rawItems
  const truncatedNote =
    truncatedCount > 0
      ? `\nℹ️ Chỉ lấy 10 khoản đầu (${truncatedCount} khoản bị bỏ qua)`
      : ''

  const { validItems, aiMappings, counters } = normalizeNaturalItems(
    cappedRawItems,
    aiContext,
    defaultDate,
  )

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

  // Derived from same capped availableHouseholds as householdNameToId; missing id → graceful no-suffix (no DB fallback needed)
  const householdNameById = aiContext
    ? new Map(aiContext.availableHouseholds.map((h) => [h.id, h.name]))
    : undefined

  const created = await createNaturalExpenses({
    db: deps.db,
    appUserId,
    validItems,
    aiMappings,
    amountResult,
    correlationId,
    text,
    householdNameById,
  })

  if (created.length === 0) {
    await client.editMessageText(
      message.chat.id,
      loaderMsgId,
      INPUT_UNRECOGNIZED_TEXT,
      { parseMode: 'HTML' },
    )

    return 1
  }

  await sendPostCreateMessages(
    client,
    message.chat.id,
    loaderMsgId,
    created,
    truncatedNote,
  )

  // ctx is built above for consistency with the rest of the bot code;
  // a future slice may need it for rate limiting / locale-specific copy.
  void ctx

  return 1
}
