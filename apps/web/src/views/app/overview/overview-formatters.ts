import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

function getCurrentPeriod() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function formatCurrency(amountMinor: number, currencyCode: string) {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMinor / 100)

  if (currencyCode === 'VND') {
    return formatted.replace('₫', 'đ')
  }

  return formatted
}

function formatPeriodLabel(period: string) {
  const [year, month] = period.split('-')

  return t('app.overview.summary.period', {
    month,
    year,
  })
}

function getRoleLabel(role: HouseholdDTO['role']) {
  return t(`app.householdDetail.members.invite.fields.role.options.${role}`)
}

export { formatCurrency, formatPeriodLabel, getCurrentPeriod, getRoleLabel }
