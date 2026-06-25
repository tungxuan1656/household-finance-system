/**
 * Public API for the Telegram format helper module.
 * Re-exports all utilities, constants, category helpers, and renderers.
 */

export * from './category-emojis'
export * from './category-meta'
export * from './constants'
export * from './utils'

import { formatMinorAmount } from '@/lib/currency'

import type { InlineKeyboardMarkup } from '../types'
import { getCategoryEmoji } from './category-emojis'
import { getCategoryLabel } from './category-meta'
import { buildProgressBar, escapeHtml } from './utils'

export { formatMinorAmount }

// ─── Shared option types ────────────────────────────────────────────────

export interface ParsedPreviewData {
  amountMinor: number
  occurredAt: string // YYYY-MM-DD
  categoryKey: string
  title: string
  sourceKey: string
  scope: 'personal' | 'household'
  householdId?: string
  householdName?: string
  groupName?: string
}

export type BudgetStatusLabel = 'ok' | 'warning' | 'exceeded'

export interface StatsOptions {
  totalSpendMinor: number
  expenseCount: number
  currencyCode: string
  scopeLabel: string
  periodLabel: string
}

export interface TopCategoriesOptions {
  categories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
  }>
  scopeLabel: string
  periodLabel: string
}

export interface ExpensePreviewOptions extends ParsedPreviewData {
  currencyCode: string
}

export interface BudgetLineOptions {
  name: string
  totalPlannedMinor: number
  totalActualMinor: number
  currencyCode: string
  status: BudgetStatusLabel
}

export interface BudgetAlertOptions {
  name: string
  totalPlannedMinor: number
  totalActualMinor: number
  currencyCode: string
  isExceeded: boolean
}

export interface HouseholdActivityOptions {
  actorName: string
  householdName: string
  title: string
  amountMinor: number
  categoryKey: string
  occurredAt: string
  currencyCode: string
}

export interface WeeklyDigestOptions {
  totalSpendMinor: number
  expenseCount: number
  topCategories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
  }>
  budgetWarnings: Array<{
    name: string
    status: 'exceeded' | 'warning'
    percent: number
  }>
  currencyCode: string
  periodLabel: string
  deepLinkUrl?: string
}

// ─── Private helpers ────────────────────────────────────────────────────

const getSourceLabel = (key: string): string => {
  const labels: Record<string, string> = {
    cash: 'Tiền mặt',
    'bank-transfer': 'Chuyển khoản',
    card: 'Thẻ',
    momo: 'MoMo',
    'zalo-pay': 'ZaloPay',
    'shopee-pay': 'ShopeePay',
    other: 'Khác',
  }

  return labels[key] ?? key
}

// ─── Render functions ───────────────────────────────────────────────────

/** Render stats overview text. */
export function renderStatsText(options: StatsOptions): string {
  const formatted = formatMinorAmount(
    options.totalSpendMinor,
    options.currencyCode,
  )
  const countLabel =
    options.expenseCount === 1 ? '1 khoản' : `${options.expenseCount} khoản`

  return (
    `<b>${options.scopeLabel}</b> · ${options.periodLabel}\n\n` +
    `<code>${formatted} ${options.currencyCode}</code>\n` +
    `${countLabel}`
  )
}

/** Render top categories text with progress bars. */
export function renderTopCategoriesText(options: TopCategoriesOptions): string {
  if (options.categories.length === 0) {
    return (
      `<b>Top danh mục</b> · ${options.periodLabel}\n\n` +
      `Chưa có chi tiêu trong kỳ này.`
    )
  }

  const lines = options.categories.map((cat) => {
    const label = getCategoryLabel(cat.categoryKey)
    const amount = formatMinorAmount(cat.totalSpendMinor)
    const bar = buildProgressBar(cat.percentOfTotal)

    return `<b>${label}</b>\n<code>${amount}₫</code> · ${bar} ${cat.percentOfTotal}%`
  })

  return `<b>Top danh mục</b> · ${options.periodLabel}\n\n${lines.join('\n\n')}`
}

/** Render an expense preview text. */
export function renderExpensePreviewText(
  options: ExpensePreviewOptions,
): string {
  const amountFormatted = formatMinorAmount(
    options.amountMinor,
    options.currencyCode,
  )
  const categoryLabel = getCategoryLabel(options.categoryKey)
  const scopeLabel =
    options.scope === 'household' && options.householdName
      ? options.householdName
      : 'Cá nhân'
  let text =
    `<b>${amountFormatted} ${options.currencyCode}</b> · ${categoryLabel}\n` +
    `${escapeHtml(options.title)}\n` +
    `<code>${options.occurredAt}</code> · ${getSourceLabel(options.sourceKey)} · ${scopeLabel}`
  if (options.groupName) {
    text += ` · ${options.groupName}`
  }

  return text
}

/** Render a compact one-line expense summary. Used in confirm/household-select. */
export function renderExpenseSummaryLine(
  options: ExpensePreviewOptions,
): string {
  const amountFormatted = formatMinorAmount(
    options.amountMinor,
    options.currencyCode,
  )
  const parts = options.occurredAt.split('-')
  const shortDate =
    parts.length === 3 ? `${parts[2]}/${parts[1]}` : options.occurredAt
  const emoji = getCategoryEmoji(options.categoryKey)

  return `${emoji} ${escapeHtml(options.title)} · <code>${amountFormatted}₫</code> · ${shortDate}`
}

/** Render a single budget status line. */
export function renderBudgetLine(options: BudgetLineOptions): string {
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
  let emoji: string
  let label: string
  switch (options.status) {
    case 'exceeded':
      emoji = '🔴'
      label = `Đã vượt ${percent}%`
      break
    case 'warning':
      emoji = '🟡'
      label = `Đã dùng ${percent}%`
      break
    default:
      emoji = '🟢'
      label = `Đã dùng ${percent}%`
  }

  return `${emoji} <b>${options.name}</b>\n<code>${actual}</code> / <code>${planned}</code> ${options.currencyCode} · ${label}`
}

/** Render full budget status text from individual lines. */
export function renderBudgetStatusText(lines: string[]): string {
  if (lines.length === 0) {
    return '<b>Ngân sách</b>\n\nChưa có ngân sách nào.'
  }

  return '<b>Ngân sách</b>\n\n' + lines.join('\n\n')
}

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
