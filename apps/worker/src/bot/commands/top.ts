import { getAnalyticsOverview } from '@/db/repositories/expense-analytics-repository'

import { renderTopCategoriesText } from '../renderers/finance-text'
import { openAppKeyboard } from '../renderers/keyboards'
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
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập và sử dụng thống kê.\n\n' +
        '🏠 <a href="https://t.me/household_finance_bot/app">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(),
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
    text: renderTopCategoriesText(
      overview.topCategories,
      scopeLabel,
      data.periodLabel,
    ),
    parseMode: 'HTML',
    replyMarkup: openAppKeyboard(),
  }
}
