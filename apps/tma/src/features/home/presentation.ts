import {
  getComparisonGranularityLabel,
  type PeriodGranularity,
} from '@/lib/period'

import type {
  AnalyticsComparisonDTO,
  BudgetDTO,
  CategoryKey,
  ReferenceCategoryDTO,
} from './types'

export interface AccentToken {
  background: string
  foreground: string
}

export interface CategoryPresentation {
  label: string
  symbol: string
  iconUrl?: string
  accent: AccentToken
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
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

const FALLBACK_ACCENTS: Partial<Record<CategoryKey, AccentToken>> = {
  food: { background: '#edf4ff', foreground: '#3f7cff' },
  transport: { background: '#eef9f0', foreground: '#2f9b44' },
  shopping: { background: '#fff3e8', foreground: '#ff8a3d' },
  'living-costs': { background: '#fff6d9', foreground: '#b48800' },
  health: { background: '#ffeef2', foreground: '#d14d7b' },
  family: { background: '#f0f0ff', foreground: '#6250d4' },
  education: { background: '#ebfbff', foreground: '#148ea1' },
  travel: { background: '#fff0f6', foreground: '#c94c7c' },
}

const DEFAULT_ACCENT: AccentToken = {
  background: 'rgba(17, 24, 39, 0.06)',
  foreground: '#111827',
}

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()
const currencyFractionDigitsCache = new Map<string, number>()

const getCurrencyFormatter = (currencyCode: string): Intl.NumberFormat => {
  const cached = currencyFormatterCache.get(currencyCode)

  if (cached) {
    return cached
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  })

  currencyFormatterCache.set(currencyCode, formatter)

  return formatter
}

const getCurrencyFractionDigits = (currencyCode: string): number => {
  const cached = currencyFractionDigitsCache.get(currencyCode)

  if (typeof cached === 'number') {
    return cached
  }

  try {
    const fractionDigits =
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2

    currencyFractionDigitsCache.set(currencyCode, fractionDigits)

    return fractionDigits
  } catch {
    return 2
  }
}

const withAlpha = (hexColor: string, alpha: number): string | null => {
  const normalized = hexColor.trim()

  if (!/^#([\dA-F]{3}|[\dA-F]{6})$/i.test(normalized)) {
    return null
  }

  const hex =
    normalized.length === 4
      ? normalized
          .slice(1)
          .split('')
          .map((part) => part + part)
          .join('')
      : normalized.slice(1)

  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export const resolveUserName = (
  displayName: string | null,
  email: string | null,
): string => {
  if (displayName && displayName.trim().length > 0) {
    return displayName
  }

  if (email && email.includes('@')) {
    return email.split('@')[0]
  }

  return 'Bạn'
}

export const resolveInitials = (value: string): string =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')[0]
          ?.toUpperCase() ?? '',
    )
    .join('')

export const formatCurrencyMinor = (
  amountMinor: number,
  currencyCode: string,
): string => {
  const fractionDigits = getCurrencyFractionDigits(currencyCode)
  const amountMajor = amountMinor / 10 ** fractionDigits

  return getCurrencyFormatter(currencyCode).format(amountMajor)
}

export const getCategoryLabel = (
  categoryKey: CategoryKey | undefined,
): string =>
  categoryKey ? CATEGORY_LABELS[categoryKey] : CATEGORY_LABELS.other

export const getCategoryPresentation = (
  categoryKey: CategoryKey | undefined,
  referenceCategories?: ReferenceCategoryDTO[],
): CategoryPresentation => {
  const key = categoryKey ?? 'other'
  const label = getCategoryLabel(key)
  const match = referenceCategories?.find((item) => item.key === key)
  const accentBackground = match?.color ? withAlpha(match.color, 0.1) : null
  const accent =
    match?.color && accentBackground
      ? {
          background: accentBackground,
          foreground: match.color,
        }
      : (FALLBACK_ACCENTS[key] ?? DEFAULT_ACCENT)

  return {
    label,
    symbol: resolveInitials(label),
    iconUrl: match?.iconUrl,
    accent,
  }
}

export const getBudgetProgress = (
  totalSpendMinor: number,
  budget: BudgetDTO | null | undefined,
) => {
  if (!budget) {
    return null
  }

  const percentUsed = Math.round(
    (totalSpendMinor / Math.max(budget.totalLimitMinor, 1)) * 100,
  )
  const remainingMinor = budget.totalLimitMinor - totalSpendMinor

  return {
    budgetLimitMinor: budget.totalLimitMinor,
    isOverBudget: remainingMinor < 0,
    percentUsed,
    remainingMinor,
  }
}

export const getComparisonLabel = (
  comparison: AnalyticsComparisonDTO | undefined,
  fallbackExpenseCount: number,
  granularity: PeriodGranularity = 'month',
): string => {
  if (!comparison) {
    return `${fallbackExpenseCount} khoản`
  }

  if (comparison.totalDeltaPercent == null) {
    return `${comparison.currentPeriod.expenseCount} khoản`
  }

  if (comparison.totalDeltaPercent === 0) {
    return `Không đổi so với ${getComparisonGranularityLabel(granularity)}`
  }

  const prefix = comparison.totalDeltaPercent > 0 ? '+' : ''

  return `${prefix}${comparison.totalDeltaPercent}% so với ${getComparisonGranularityLabel(granularity)}`
}

export const getHouseholdBudgetLabel = (
  totalSpendMinor: number | undefined,
  budget: BudgetDTO | null | undefined,
): string => {
  if (!budget || totalSpendMinor == null) {
    return 'Chưa có ngân sách'
  }

  const remainingPercent = Math.round(
    (Math.max(budget.totalLimitMinor - totalSpendMinor, 0) /
      Math.max(budget.totalLimitMinor, 1)) *
      100,
  )

  if (totalSpendMinor > budget.totalLimitMinor) {
    const overPercent = Math.round(
      ((totalSpendMinor - budget.totalLimitMinor) /
        Math.max(budget.totalLimitMinor, 1)) *
        100,
    )

    return `Vượt ${overPercent}%`
  }

  return `Còn ${remainingPercent}%`
}

export const getExpenseSecondaryText = (
  note: string | null,
  categoryLabel: string,
): string => {
  const trimmed = note?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : categoryLabel
}

export const getExpenseGroupLabel = (
  groupIds: string[] | undefined,
): string | null => {
  if (!groupIds || groupIds.length === 0) {
    return null
  }

  return groupIds.length === 1 ? '1 nhóm' : `${groupIds.length} nhóm`
}
