/**
 * Natural-input expense direct-create flow (feat-121).
 *
 * Unlike `/add`, the natural (non-command) chat path skips
 * the preview/confirm step. When the amount detector + AI parser produce
 * at least one valid expense, the bot creates each expense immediately
 * and sends one Telegram message per created expense. Each message carries
 * a `postCreateKeyboard` (`🏠 Chọn gia đình` + `🗑 Xoá`) so the user can
 * fix mistakes with 1 tap.
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
import {
  createExpense,
  type CreateExpenseInput,
} from '@/db/repositories/expense-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { AiUpstreamError, parseExpensesWithAi } from '@/lib/ai/expense-parser'
import { getMinorUnits } from '@/lib/currency'
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

  let rawItems: Array<{
    amount: number
    categoryKey: string
    sourceKey?: string
    title: string
    occurredAt?: string
  }>

  try {
    rawItems = await parseExpensesWithAi(
      text,
      {
        baseUrl: deps.env.OPENAI_COMPAT_BASE_URL,
        apiKey: deps.env.OPENAI_COMPAT_API_KEY,
        model: deps.env.OPENAI_COMPAT_MODEL,
      },
      { defaultOccurredAt: defaultDate },
    )
  } catch (error) {
    if (error instanceof AiUpstreamError) {
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
  // its own AI-parsed amount.
  const validItems: ParsedExpenseItem[] = []

  for (const raw of rawItems) {
    const normalized = normalizeAiItem(raw, defaultDate)
    if (normalized) validItems.push(normalized)
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

  for (const item of validItems) {
    const amountVnd =
      validItems.length === 1 ? amountResult.amountVnd : item.amount
    const amountMinor = getMinorUnits(amountVnd, 'VND')
    const occurredAtMs = Date.parse(item.occurredAt)

    const input: CreateExpenseInput = {
      id: newId(),
      householdId: null, // personal by default; reassigned via the post-create button
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

      // Audit log — natural input write (used by the post-create handlers
      // to attribute delete/household-change events to the same source).
      await createAuditLogEntry(deps.db, {
        householdId: null,
        actorUserId: appUserId,
        actionType: 'expense.created',
        targetType: 'expense',
        targetId: expense.id,
        payloadJson: JSON.stringify({
          source: 'telegram_bot',
          expenseId: expense.id,
          naturalInput: true,
          rawText: text,
        }),
      }).catch((err: unknown) => {
        console.error('natural-expense: audit log write failed', err)
      })

      const summary = renderExpenseSummaryLine({
        amountMinor,
        occurredAt: item.occurredAt,
        categoryKey: item.categoryKey,
        title: item.title,
        sourceKey: item.sourceKey,
        scope: 'personal',
        currencyCode: 'VND',
      })

      created.push({ expenseId: expense.id, summary, input })
    } catch (err) {
      console.error('natural-expense: createExpense failed', err)
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
