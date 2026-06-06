import { formatCurrencyMinor } from '@/features/home/presentation'

import type { ExpenseGroupDTO, GroupListItem } from './types'

export const GROUP_CONTEXT_PERSONAL_LABEL = 'Cá nhân'

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})

export const formatGroupDate = (value: number | null | undefined): string =>
  typeof value === 'number' ? DATE_FORMATTER.format(new Date(value)) : ''

export const getGroupStatusLabel = (status: ExpenseGroupDTO['status']) =>
  status === 'active' ? 'Đang theo dõi' : 'Đã lưu trữ'

export const getGroupContextLabel = (
  item: Pick<GroupListItem, 'group' | 'household'>,
): string => item.household?.name ?? GROUP_CONTEXT_PERSONAL_LABEL

export const getGroupDateRangeLabel = (
  group: Pick<ExpenseGroupDTO, 'endDate' | 'startDate'>,
): string => {
  const start = formatGroupDate(group.startDate)
  const end = formatGroupDate(group.endDate)

  if (start && end) return `${start} - ${end}`
  if (start) return `Từ ${start}`
  if (end) return `Đến ${end}`

  return 'Không giới hạn thời gian'
}

export const getGroupBudgetLabel = (
  group: Pick<ExpenseGroupDTO, 'eventBudgetMinor'>,
): string =>
  group.eventBudgetMinor != null && group.eventBudgetMinor > 0
    ? formatCurrencyMinor(group.eventBudgetMinor, 'VND')
    : 'Chưa đặt ngân sách'

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
