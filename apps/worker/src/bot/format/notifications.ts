import { formatMinorAmount } from '@/lib/currency'

import type { InlineKeyboardMarkup } from '../types'
import { getCategoryEmoji } from './category-emojis'
import { getCategoryLabel } from './category-meta'
import type {
  BudgetAlertOptions,
  HouseholdActivityOptions,
  WeeklyDigestOptions,
} from './types'
import { escapeHtml } from './utils'

/** Render a budget alert notification text. */
export function renderBudgetAlertText(options: BudgetAlertOptions): string {
  const planned = formatMinorAmount(
    options.totalPlannedMinor,
    options.currencyCode,
  )
  const actual = formatMinorAmount(
    options.totalActualMinor,
    options.currencyCode,
  )
  const percent =
    options.totalPlannedMinor > 0
      ? Math.round((options.totalActualMinor / options.totalPlannedMinor) * 100)
      : 0
  const header = options.isExceeded
    ? '🔴 Vượt ngân sách'
    : '🟡 Sắp hết ngân sách'

  return (
    `${header}\n\n` +
    `<b>${options.name}</b>\n` +
    `<code>${actual}</code> / <code>${planned}</code> ${options.currencyCode} · ${percent}%`
  )
}

/**
 * Common inline keyboard for budget alerts.
 */
export const budgetAlertKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '📊 Xem chi tiết', callback_data: 'budget' },
      { text: '🏠 Mở Mini App', web_app: { url: tmaUrl } },
    ],
  ],
})

/** Render a household activity notification. */
export function renderHouseholdActivityText(
  options: HouseholdActivityOptions,
): string {
  const amount = formatMinorAmount(options.amountMinor, options.currencyCode)
  const catLabel = getCategoryLabel(options.categoryKey)
  const emoji = getCategoryEmoji(options.categoryKey)

  return (
    `<b>${options.householdName}</b>\n` +
    `${options.actorName} đã thêm:\n\n` +
    `${emoji} <code>${amount} ${options.currencyCode}</code> · ${catLabel}\n` +
    `${escapeHtml(options.title)}\n` +
    `<code>${options.occurredAt}</code>`
  )
}

/** Render a weekly digest notification. */
export function renderWeeklyDigestText(options: WeeklyDigestOptions): string {
  const total = formatMinorAmount(options.totalSpendMinor, options.currencyCode)
  const countLabel =
    options.expenseCount === 1 ? '1 khoản' : `${options.expenseCount} khoản`
  let text =
    `<b>Tuần ${options.periodLabel}</b>\n\n` +
    `<code>${total} ${options.currencyCode}</code> · ${countLabel}\n`
  if (options.topCategories.length > 0) {
    text += '\n<b>Chi nhiều nhất:</b>\n'

    text += options.topCategories
      .slice(0, 3)
      .map((cat) => {
        const label = getCategoryLabel(cat.categoryKey)
        const amount = formatMinorAmount(
          cat.totalSpendMinor,
          options.currencyCode,
        )
        const emoji = getCategoryEmoji(cat.categoryKey)

        return `${emoji} ${label} · <code>${amount} ${options.currencyCode}</code> · ${cat.percentOfTotal}%`
      })
      .join('\n')
  }
  if (options.budgetWarnings.length > 0) {
    text += '\n\n<b>Ngân sách:</b>\n'
    for (const bw of options.budgetWarnings) {
      const emoji = bw.status === 'exceeded' ? '🔴' : '🟡'
      text += `${emoji} ${bw.name} · ${bw.percent}%\n`
    }
  }
  if (options.deepLinkUrl) {
    text += `\n\n🏠 <a href="${options.deepLinkUrl}">Mở Mini App</a>`
  }

  return text
}
