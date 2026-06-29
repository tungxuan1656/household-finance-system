import { formatMinorAmount } from '@/lib/currency'

import { getCategoryEmoji } from './category-emojis'
import { getCategoryLabel } from './category-meta'
import type {
  BudgetLineOptions,
  ExpensePreviewOptions,
  StatsOptions,
  TopCategoriesOptions,
} from './types'
import { buildProgressBar, escapeHtml } from './utils'

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
    const amount = formatMinorAmount(cat.totalSpendMinor, options.currencyCode)
    const bar = buildProgressBar(cat.percentOfTotal)

    return `<b>${label}</b>\n<code>${amount} ${options.currencyCode}</code> · ${bar} ${cat.percentOfTotal}%`
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
      ? escapeHtml(options.householdName)
      : 'Cá nhân'
  let text =
    `<b>${amountFormatted} ${options.currencyCode}</b> · ${categoryLabel}\n` +
    `${escapeHtml(options.title)}\n` +
    `<code>${options.occurredAt}</code> · ${scopeLabel}`
  if (options.groupName) {
    text += ` · ${escapeHtml(options.groupName)}`
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
  const amountWithCurrency =
    options.currencyCode === 'VND'
      ? `${amountFormatted}₫`
      : `${amountFormatted} ${options.currencyCode}`
  const parts = options.occurredAt.split('-')
  const shortDate =
    parts.length === 3 ? `${parts[2]}/${parts[1]}` : options.occurredAt
  const emoji = getCategoryEmoji(options.categoryKey)
  const label = getCategoryLabel(options.categoryKey)

  return `${emoji} ${escapeHtml(label)} · ${escapeHtml(options.title)} · <code>${amountWithCurrency}</code> · ${shortDate}`
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

  return `${emoji} <b>${escapeHtml(options.name)}</b>\n<code>${actual}</code> / <code>${planned}</code> ${options.currencyCode} · ${label}`
}

/** Render full budget status text from individual lines. */
export function renderBudgetStatusText(lines: string[]): string {
  if (lines.length === 0) {
    return '<b>Ngân sách</b>\n\nChưa có ngân sách nào.'
  }

  return '<b>Ngân sách</b>\n\n' + lines.join('\n\n')
}

/** Render a list of recent expenses for /recents command. */
export function renderRecentsText(options: {
  expenses: Array<{
    amountMinor: number
    occurredAt: string // YYYY-MM-DD
    categoryKey: string
    title: string
    currencyCode: string
  }>
}): string {
  if (options.expenses.length === 0) {
    return '<b>Chi tiêu gần đây</b>\n\nChưa có chi tiêu nào.'
  }

  const lines = options.expenses.map((e) =>
    renderExpenseSummaryLine({
      amountMinor: e.amountMinor,
      occurredAt: e.occurredAt,
      categoryKey: e.categoryKey,
      title: e.title,
      sourceKey: 'other',
      scope: 'personal',
      currencyCode: e.currencyCode,
    }),
  )

  return '<b>Chi tiêu gần đây</b>\n\n' + lines.join('\n')
}
