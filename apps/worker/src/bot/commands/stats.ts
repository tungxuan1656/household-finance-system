import { renderStatsText } from '@/bot/format'
import { getAnalyticsOverview } from '@/db/repositories/expense-analytics-repository'

import { openAppKeyboard, statsKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'
import { resolveReadScope } from './read-scope'

/**
 * Handle /stats command.
 *
 * Usage:
 *  /stats            — personal scope, current month
 *  /stats hh:<id>    — household scope by id
 *  /stats household  — first accessible household
 *
 * Unlinked users get Open App guidance.
 */
export const handleStatsCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      text:
        'Mở Mini App để xem thống kê.\n\n' +
        '🏠 <a href="' +
        tmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(tmaUrl),
    }
  }

  const resolved = await resolveReadScope(ctx)

  if ('error' in resolved) {
    return resolved.error
  }

  const { data } = resolved
  const db = ctx.db

  const overview = await getAnalyticsOverview(db, {
    userId: ctx.appUserId,
    householdId: data.householdId,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    period: data.period,
  })

  const scopeLabel = data.isHousehold
    ? `gia đình ${data.householdName}`
    : 'cá nhân'

  return {
    text: renderStatsText({
      totalSpendMinor: overview.totalSpendMinor,
      expenseCount: overview.expenseCount,
      currencyCode: overview.currencyCode,
      scopeLabel,
      periodLabel: data.periodLabel,
    }),
    parseMode: 'HTML',
    replyMarkup: statsKeyboard(tmaUrl),
  }
}
