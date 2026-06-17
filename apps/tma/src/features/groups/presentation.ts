import { formatCurrencyMinor } from '@/features/home/presentation'
import { capitalize } from '@/lib/period'

import type { ExpenseGroupDTO, GroupListItem } from './types'

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})

export const formatGroupDate = (value: number | null | undefined): string =>
  typeof value === 'number' ? DATE_FORMATTER.format(new Date(value)) : ''

export const getGroupStatusLabel = (
  status: ExpenseGroupDTO['status'],
  t: (key: string, options?: Record<string, unknown>) => string,
) => t(`groups.status${capitalize(status)}`)

export const getGroupContextLabel = (
  item: Pick<GroupListItem, 'group' | 'household'>,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => item.household?.name ?? t('groups.contextPersonal')

export const getGroupDateRangeLabel = (
  group: Pick<ExpenseGroupDTO, 'endDate' | 'startDate'>,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => {
  const start = formatGroupDate(group.startDate)
  const end = formatGroupDate(group.endDate)

  if (start && end) return t('groups.dateRange', { start, end })
  if (start) return t('groups.dateFrom', { date: start })
  if (end) return t('groups.dateTo', { date: end })

  return t('groups.dateUnbounded')
}

export const getGroupBudgetLabel = (
  group: Pick<ExpenseGroupDTO, 'eventBudgetMinor'>,
  t: (key: string, options?: Record<string, unknown>) => string,
): string =>
  group.eventBudgetMinor != null && group.eventBudgetMinor > 0
    ? formatCurrencyMinor(group.eventBudgetMinor, 'VND')
    : t('groups.budgetUnset')

export const getGroupProgress = (
  totalSpendMinor: number,
  eventBudgetMinor: number | null | undefined,
) => {
  if (eventBudgetMinor == null || eventBudgetMinor <= 0) {
    return null
  }

  const percentUsed = Math.round(
    (totalSpendMinor / Math.max(eventBudgetMinor, 1)) * 100,
  )

  return {
    isOverBudget: totalSpendMinor > eventBudgetMinor,
    percentUsed,
    widthPercent: Math.min(percentUsed, 100),
  }
}

export const formatOptionalGroupMoney = (amountMinor: number | null): string =>
  amountMinor == null ? '-' : formatCurrencyMinor(amountMinor, 'VND')

export const parseOptionalDateInput = (value: string): number | undefined => {
  if (!value) {
    return undefined
  }

  const timestamp = new Date(`${value}T00:00:00.000Z`).getTime()

  return Number.isFinite(timestamp) ? timestamp : undefined
}

export const parseBudgetInputToMinor = (value: string): number | undefined => {
  const digits = value.replaceAll(/\D/g, '')

  return digits.length > 0 ? Number(digits) : undefined
}
