import { format } from 'date-fns'

import { t } from '@/lib/i18n/t'

export function formatDate(timestamp: number, formatStr: string): string
export function formatDate(
  timestamp: number | null | undefined,
  formatStr: string,
): string | null
export function formatDate(
  timestamp: number | null | undefined,
  formatStr: string,
): string | null {
  if (timestamp == null) {
    return null
  }

  return format(new Date(timestamp), formatStr)
}

export const formatRelativeDate = (timestampSec: number): string => {
  const now = new Date()
  const date = new Date(timestampSec * 1000)
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) {
    return t('app.overview.recentExpenses.today')
  }

  if (diffDays === 1) {
    return t('app.overview.recentExpenses.yesterday')
  }

  return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
}

export const getDaysRemaining = (): number => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return lastDay.getDate() - now.getDate() + 1
}
