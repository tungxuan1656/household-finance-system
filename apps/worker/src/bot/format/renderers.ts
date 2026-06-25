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
