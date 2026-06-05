import {
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getComparisonLabel,
} from '@/features/home/presentation'
import { getCurrentPeriod } from '@/lib/period'

export const HomeOverviewSection = () => {
  const period = getCurrentPeriod()
  const overviewQuery = useAnalyticsOverviewQuery({ period })
  const comparisonQuery = useAnalyticsComparisonQuery({ period })

  const overview = overviewQuery.data
  const comparison = comparisonQuery.data
  const isLoading = overviewQuery.isLoading || comparisonQuery.isLoading
  const isError = Boolean(overviewQuery.error || comparisonQuery.error)

  return (
    <section className='tma-summary-card tma-summary-card--home'>
      <div className='tma-summary-card__topline'>
        <div>
          <p className='tma-section-label'>Tổng chi tháng này</p>
          <strong className='font-mono'>
            {overview
              ? formatCurrencyMinor(
                  overview.totalSpendMinor,
                  overview.currencyCode,
                )
              : isLoading
                ? 'Đang tải...'
                : '—'}
          </strong>
        </div>

        <span className='tma-status-pill'>
          {isError
            ? 'Lỗi dữ liệu'
            : isLoading
              ? 'Đang cập nhật'
              : getComparisonLabel(comparison, overview?.expenseCount ?? 0)}
        </span>
      </div>

      <div className='tma-summary-card__meter-meta'>
        <span>{overview?.expenseCount ?? 0} khoản chi</span>
      </div>
    </section>
  )
}
