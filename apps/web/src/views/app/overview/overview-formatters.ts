import { t } from '@/lib/i18n/t'

function getCurrentPeriod() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function formatPeriodLabel(period: string) {
  const [year, month] = period.split('-')

  return t('app.overview.summary.period', {
    month,
    year,
  })
}

export { formatPeriodLabel, getCurrentPeriod }
