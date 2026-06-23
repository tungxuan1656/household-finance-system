/**
 * Vietnamese category labels matching TMA locale.
 * Key is the reference category key from REFERENCE_CATEGORY_KEYS.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  dating: 'Hẹn hò',
  'living-costs': 'Sinh hoạt phí',
  family: 'Gia đình',
  children: 'Con cái',
  relatives: 'Người thân',
  shopping: 'Mua sắm',
  beauty: 'Làm đẹp',
  health: 'Sức khỏe',
  social: 'Xã giao',
  repairs: 'Sửa chữa',
  work: 'Công việc',
  education: 'Giáo dục',
  investment: 'Đầu tư',
  'self-development': 'Phát triển bản thân',
  sports: 'Thể thao',
  travel: 'Du lịch',
  hobbies: 'Sở thích',
  pets: 'Thú cưng',
  'money-in': 'Tiền vào',
  lending: 'Cho vay',
  charity: 'Từ thiện',
  other: 'Khác',
}

export const getCategoryLabel = (key: string): string =>
  CATEGORY_LABELS[key] ?? key

/**
 * Format a minor-amount integer to a readable Vietnamese string.
 * Uses currency-aware fraction digits (VND=0, USD=2, etc.).
 * Example: formatMinorAmount(30000, 'VND') → "30.000"
 *          formatMinorAmount(12345, 'USD') → "123.45"
 */
import { formatMinorAmount } from '@/lib/currency'

export { formatMinorAmount }

/**
 * Get the current period key in YYYY-MM format.
 */
export const getCurrentPeriod = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')

  return `${year}-${month}`
}

/**
 * Convert a YYYY-MM period to start/end epoch milliseconds.
 */
export const toPeriodRange = (
  period: string,
): { start: number; end: number } => {
  const [yearValue, monthValue] = period.split('-')
  const year = Number(yearValue)
  const monthIndex = Number(monthValue) - 1

  return {
    start: Date.UTC(year, monthIndex, 1),
    end: Date.UTC(year, monthIndex + 1, 1),
  }
}

/**
 * Format a period key to a human-readable Vietnamese label.
 */
export const formatPeriodLabel = (period: string): string => {
  const [year, month] = period.split('-')

  return `Tháng ${Number(month)}/${year}`
}

/**
 * Render a stats overview text for Telegram.
 */
export const renderStatsText = (
  totalSpendMinor: number,
  expenseCount: number,
  currencyCode: string,
  scopeLabel: string,
  periodLabel: string,
): string => {
  const formatted = formatMinorAmount(totalSpendMinor, currencyCode)
  const countLabel = expenseCount === 1 ? '1 khoản' : `${expenseCount} khoản`

  return (
    `📊 <b>Thống kê ${scopeLabel}</b>\n` +
    `${periodLabel}\n\n` +
    `💰 <b>${formatted} ${currencyCode}</b>\n` +
    `📝 ${countLabel}`
  )
}

import { renderProgressBar } from './progress-bar'

export { renderProgressBar }

/**
 * Render top categories text for Telegram.
 * Each category line includes a progress bar visual.
 */
export const renderTopCategoriesText = (
  categories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
  }>,
  scopeLabel: string,
  periodLabel: string,
): string => {
  if (categories.length === 0) {
    return (
      `📊 <b>Danh mục chi tiêu</b>\n` +
      `${scopeLabel} · ${periodLabel}\n\n` +
      `Chưa có chi tiêu trong kỳ này.`
    )
  }

  const lines = categories.map((cat) => {
    const label = getCategoryLabel(cat.categoryKey)
    const amount = formatMinorAmount(cat.totalSpendMinor)
    const bar = renderProgressBar(cat.percentOfTotal)

    // Amount on its own line so Telegram clients (variable-width tabs) align it.
    return `${label}\n<b>${amount}₫</b>\n${bar} ${cat.percentOfTotal}%`
  })

  return (
    `📊 <b>Danh mục chi tiêu</b>\n` +
    `${scopeLabel} · ${periodLabel}\n\n` +
    lines.join('\n\n')
  )
}

export interface ParsedPreviewData {
  amountMinor: number
  occurredAt: string // YYYY-MM-DD
  categoryKey: string
  title: string
  sourceKey: string
  scope: 'personal' | 'household'
  householdId?: string // null/undefined for personal
  householdName?: string
  groupName?: string
}

/**
 * Render an expense preview text for Telegram.
 */
export const renderExpensePreviewText = (
  preview: ParsedPreviewData,
  currencyCode: string,
): string => {
  const amountFormatted = formatMinorAmount(preview.amountMinor, currencyCode)
  const categoryLabel = getCategoryLabel(preview.categoryKey)

  const scopeLabel =
    preview.scope === 'household' && preview.householdName
      ? `🏠 ${preview.householdName}`
      : '👤 Cá nhân'

  let text =
    '📝 <b>Xem trước chi tiêu</b>\n\n' +
    `💰 <b>Số tiền:</b> ${amountFormatted} ${currencyCode}\n` +
    `📂 <b>Danh mục:</b> ${categoryLabel}\n` +
    `📅 <b>Ngày:</b> ${preview.occurredAt}\n` +
    `📄 <b>Nội dung:</b> ${preview.title}\n` +
    `🔗 <b>Nguồn:</b> ${getSourceLabel(preview.sourceKey)}\n` +
    `👥 <b>Phạm vi:</b> ${scopeLabel}`

  if (preview.groupName) {
    text += `\n📁 <b>Nhóm:</b> ${preview.groupName}`
  }

  text += '\n\nChọn hành động bên dưới:'

  return text
}

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

export type BudgetStatusLabel = 'ok' | 'warning' | 'exceeded'

/**
 * Render a single budget status text line.
 */
export const renderBudgetLine = (
  name: string,
  totalPlannedMinor: number,
  totalActualMinor: number,
  currencyCode: string,
  status: BudgetStatusLabel,
): string => {
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

  let emoji: string
  let label: string

  switch (status) {
    case 'exceeded': {
      emoji = '🔴'
      label = `Đã vượt ${percent}%`
      break
    }
    case 'warning': {
      emoji = '🟡'
      label = `Đã dùng ${percent}%`
      break
    }
    default: {
      emoji = '🟢'
      label = `Đã dùng ${percent}%`
      break
    }
  }

  return (
    `${emoji} <b>${name}</b>\n` +
    `  Kế hoạch: ${planned} ${currencyCode}\n` +
    `  Đã chi: ${actual} ${currencyCode}\n` +
    `  Còn lại: ${remaining} ${currencyCode}\n` +
    `  ${label}`
  )
}

/**
 * Render full budget status text for Telegram.
 */
export const renderBudgetStatusText = (lines: string[]): string => {
  if (lines.length === 0) {
    return '📋 <b>Ngân sách</b>\n\nChưa có ngân sách nào.'
  }

  return '📋 <b>Ngân sách</b>\n\n' + lines.join('\n\n')
}
