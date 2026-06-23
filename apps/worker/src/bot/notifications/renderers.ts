import { formatMinorAmount, getCategoryLabel } from '../renderers/finance-text'
import type { InlineKeyboardMarkup } from '../types'

export interface BudgetAlertTextOptions {
  name: string
  totalPlannedMinor: number
  totalActualMinor: number
  currencyCode: string
  isExceeded: boolean
}

export interface HouseholdActivityTextOptions {
  actorName: string
  householdName: string
  title: string
  amountMinor: number
  categoryKey: string
  occurredAt: string
  currencyCode: string
}

export interface WeeklyDigestTextOptions {
  totalSpendMinor: number
  expenseCount: number
  topCategories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
  }>
  budgetWarnings: Array<{ name: string; status: string; percent: number }>
  currencyCode: string
  periodLabel: string
}

/**
 * Render a budget alert notification text.
 */
export const renderBudgetAlertText = (
  options: BudgetAlertTextOptions,
): string => {
  const {
    name,
    totalPlannedMinor,
    totalActualMinor,
    currencyCode,
    isExceeded,
  } = options
  const planned = formatMinorAmount(totalPlannedMinor, currencyCode)
  const actual = formatMinorAmount(totalActualMinor, currencyCode)
  const remaining = formatMinorAmount(
    totalPlannedMinor - totalActualMinor,
    currencyCode,
  )
  const percent =
    totalPlannedMinor > 0
      ? Math.round((totalActualMinor / totalPlannedMinor) * 100)
      : 0

  const header = isExceeded
    ? `🔴 <b>Ngân sách đã vượt!</b>`
    : `🟡 <b>Ngân sách sắp hết!</b>`

  return (
    `${header}\n\n` +
    `📂 <b>${name}</b>\n` +
    `💰 Kế hoạch: ${planned} ${currencyCode}\n` +
    `💸 Đã chi: ${actual} ${currencyCode}\n` +
    `📦 Còn lại: ${remaining} ${currencyCode}\n` +
    `📊 Đã dùng ${percent}%`
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

/**
 * Render a household activity notification.
 */
export const renderHouseholdActivityText = (
  options: HouseholdActivityTextOptions,
): string => {
  const {
    actorName,
    householdName,
    title,
    amountMinor,
    categoryKey,
    occurredAt,
    currencyCode,
  } = options
  const amount = formatMinorAmount(amountMinor, currencyCode)
  const catLabel = getCategoryLabel(categoryKey)

  return (
    `🏠 <b>${householdName}</b>\n\n` +
    `${actorName} đã thêm chi tiêu:\n\n` +
    `📄 ${title}\n` +
    `💰 ${amount} ${currencyCode}\n` +
    `📂 ${catLabel}\n` +
    `📅 ${occurredAt}`
  )
}

/**
 * Render a weekly digest notification.
 */
export const renderWeeklyDigestText = (
  options: WeeklyDigestTextOptions & { deepLinkUrl: string },
): string => {
  const {
    totalSpendMinor,
    expenseCount,
    topCategories,
    budgetWarnings,
    currencyCode,
    periodLabel,
    deepLinkUrl,
  } = options
  const total = formatMinorAmount(totalSpendMinor, currencyCode)
  const countLabel = expenseCount === 1 ? '1 khoản' : `${expenseCount} khoản`

  let text =
    `📬 <b>Bản tin hàng tuần</b>\n\n` +
    `${periodLabel}\n\n` +
    `💰 <b>Tổng chi:</b> ${total} ${currencyCode}\n` +
    `📝 <b>Số khoản:</b> ${countLabel}\n`

  if (topCategories.length > 0) {
    text += `\n<b>Danh mục chi nhiều nhất:</b>\n`

    text += topCategories
      .slice(0, 3)
      .map(
        (cat) =>
          `  ${getCategoryLabel(cat.categoryKey)}: ${formatMinorAmount(cat.totalSpendMinor, currencyCode)} ${currencyCode} (${cat.percentOfTotal}%)`,
      )
      .join('\n')
  }

  if (budgetWarnings.length > 0) {
    text += `\n\n<b>Ngân sách:</b>\n`
    for (const bw of budgetWarnings) {
      const emoji = bw.status === 'exceeded' ? '🔴' : '🟡'
      text += `  ${emoji} ${bw.name}: ${bw.percent}%\n`
    }
  }

  text += `\n🏠 <a href="${deepLinkUrl}">Mở Mini App</a>`

  return text
}
