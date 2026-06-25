import { renderTopCategoriesText } from '@/bot/format'
import { getAnalyticsOverview } from '@/db/repositories/expense-analytics-repository'

import { openAppKeyboard, topKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'
import { resolveReadScope } from './read-scope'

/**
 * Handle /top command.
 *
 * Usage:
 *  /top            — personal scope, current month
 *  /top hh:<id>    — household scope by id
 *  /top household  — first accessible household
 *
 * Unlinked users get Open App guidance.
 */
export const handleTopCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      text:
        'Mở Mini App để xem top chi tiêu.\n\n' +
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
    ? `hộ gia đình ${data.householdName}`
    : 'cá nhân'

  return {
    text: renderTopCategoriesText({
      categories: overview.topCategories,
      scopeLabel,
      periodLabel: data.periodLabel,
    }),
    parseMode: 'HTML',
    replyMarkup: topKeyboard(tmaUrl),
  }
}
