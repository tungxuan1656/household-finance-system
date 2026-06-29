import { renderRecentsText } from '@/bot/format'
import { listExpenses } from '@/db/repositories/expense-query-repository'

import { openAppKeyboard, recentsKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

/**
 * Handle /recents command.
 *
 * Lists the 6 most recent personal expenses for the linked user.
 * Format mirrors the natural-chat per-expense summary (emoji + label · title · amount₫ · dd/MM).
 *
 * Unlinked users get Open App guidance.
 */
export const handleRecentsCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      text:
        'Mở Mini App để xem chi tiêu gần đây.\n\n' +
        '🏠 <a href="' +
        tmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(tmaUrl),
    }
  }

  const { items } = await listExpenses(ctx.db, {
    userId: ctx.appUserId,
    limit: 6,
  })

  const expenses = items.map((e) => ({
    amountMinor: e.amountMinor,
    occurredAt: new Date(e.occurredAt).toISOString().slice(0, 10),
    categoryKey: e.categoryKey,
    title: e.title,
    currencyCode: e.currencyCode,
  }))

  return {
    text: renderRecentsText({ expenses }),
    parseMode: 'HTML',
    replyMarkup: recentsKeyboard(tmaUrl),
  }
}
