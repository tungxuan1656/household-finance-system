import { fetchAiContext } from '@/handlers/expenses/parse-expense'
import {
  AiUpstreamError,
  parseExpensesWithAi,
  type RawAiItem,
} from '@/lib/ai/expense-parser'
import { logger } from '@/lib/logger'
import { newId } from '@/utils/id'

import { openAppKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

/**
 * Common input shared by `/add` handler after the standard
 * pre-flight checks (unlinked user, missing text, missing AI config, AI
 * parse error). Returned by `parseAiCommandInput` so both handlers can
 * skip the boilerplate and focus on their single vs batch difference.
 */
export interface ParsedAiCommandInput {
  expenseText: string
  hasScopeArg: boolean
  scopeToken: string
  defaultDate: string
  rawItems: RawAiItem[]
  aiContext?: {
    availableHouseholds: { id: string; name: string }[]
    availableGroups: { id: string; name: string; householdId: string | null }[]
    householdNameToId: Map<string, string>
    groupNameToId: Map<string, string>
  }
}

/**
 * Run the common pre-flight for `/add`:
 * - linked-user check (returns a guidance response when not linked)
 * - extract expense text + optional `hh:<id>` / `household` scope arg
 * - validate AI env config
 * - call the AI parser
 * Returns either a `{ response }` to surface immediately (error path) or
 * the parsed inputs that the caller can build drafts from.
 */
export const parseAiCommandInput = async (
  ctx: CommandContext,
): Promise<
  | { kind: 'response'; response: BotResponse }
  | { kind: 'input'; input: ParsedAiCommandInput }
> => {
  if (!ctx.appUserId) {
    return {
      kind: 'response',
      response: {
        text:
          'Mở Mini App để dùng.\n\n' +
          '🏠 <a href="' +
          ctx.telegramBotTmaUrl +
          '">Mở Mini App</a>',
        parseMode: 'HTML',
        replyMarkup: openAppKeyboard(ctx.telegramBotTmaUrl),
      },
    }
  }

  const parts = ctx.text.split(/\s+/)
  const scopeToken = parts[1] ?? ''
  const hasScopeArg = scopeToken.startsWith('hh:') || scopeToken === 'household'
  const expenseText =
    parts.length > 1
      ? parts
          .slice(hasScopeArg ? 2 : 1)
          .join(' ')
          .trim()
      : ''

  if (!expenseText) {
    return {
      kind: 'response',
      response: {
        text:
          'Nhập nội dung chi tiêu.\n\n' +
          'Vd: <code>/add ăn bún 30k 15/6</code>',
        parseMode: 'HTML',
      },
    }
  }

  if (
    !ctx.env?.OPENAI_COMPAT_BASE_URL ||
    !ctx.env?.OPENAI_COMPAT_API_KEY ||
    !ctx.env?.OPENAI_COMPAT_MODEL
  ) {
    return {
      kind: 'response',
      response: {
        text: 'AI chưa cấu hình. Thử lại sau.',
        parseMode: 'HTML',
      },
    }
  }

  const correlationId = newId()
  const defaultDate = new Date().toISOString().slice(0, 10)

  logger.info(correlationId, 'bot_ai_preflight_start', {
    textChars: expenseText.length,
    userId: ctx.userId,
    chatId: ctx.chatId,
    hasScopeArg,
  })

  // Fetch whitelist context for AI prompt (reuse feat-130 logic). Count-only logging.
  let aiContext:
    | {
        availableHouseholds: { id: string; name: string }[]
        availableGroups: {
          id: string
          name: string
          householdId: string | null
        }[]
        householdNameToId: Map<string, string>
        groupNameToId: Map<string, string>
      }
    | undefined
  let promptContext:
    | {
        households: { id: string; name: string }[]
        groups: { id: string; name: string; householdId?: string | null }[]
      }
    | undefined

  if (ctx.appUserId) {
    try {
      const fetched = await fetchAiContext(ctx.db, ctx.appUserId, correlationId)
      aiContext = fetched

      promptContext = {
        households: fetched.availableHouseholds,
        groups: fetched.availableGroups,
      }

      logger.info(correlationId, 'bot_ai_context_fetched', {
        textChars: expenseText.length,
        householdCount: fetched.availableHouseholds.length,
        groupCount: fetched.availableGroups.length,
      })
    } catch {
      // fetchAiContext already swallows inner errors; outer catch is defense-in-depth
      promptContext = undefined
    }
  }

  try {
    const rawItems = await parseExpensesWithAi(
      expenseText,
      {
        baseUrl: ctx.env.OPENAI_COMPAT_BASE_URL,
        apiKey: ctx.env.OPENAI_COMPAT_API_KEY,
        model: ctx.env.OPENAI_COMPAT_MODEL,
      },
      {
        defaultOccurredAt: defaultDate,
        correlationId,
        context: promptContext,
      },
    )

    logger.info(correlationId, 'bot_ai_preflight_success', {
      textChars: expenseText.length,
      rawItemsCount: rawItems.length,
    })

    return {
      kind: 'input',
      input: {
        expenseText,
        hasScopeArg,
        scopeToken,
        defaultDate,
        rawItems,
        ...(aiContext ? { aiContext } : {}),
      },
    }
  } catch (error) {
    if (error instanceof AiUpstreamError) {
      logger.error(correlationId, 'bot_ai_preflight_upstream_failure', {
        textChars: expenseText.length,
      })

      return {
        kind: 'response',
        response: {
          text: 'AI tạm không khả dụng. Thử lại sau.',
          parseMode: 'HTML',
        },
      }
    }

    logger.error(correlationId, 'bot_ai_preflight_error', {
      textChars: expenseText.length,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage:
        error instanceof Error
          ? error.message.slice(0, 500)
          : String(error).slice(0, 500),
    })

    throw error
  }
}
