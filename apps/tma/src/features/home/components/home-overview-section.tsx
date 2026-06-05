import { TmaDataState } from '@/components/shared/tma-data-state'
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
  const isLoading =
    !overview && (overviewQuery.isLoading || comparisonQuery.isLoading)
  const isError =
    !overview && Boolean(overviewQuery.error || comparisonQuery.error)

  return (
    <TmaDataState
      errorDescription='Không tải được tổng quan tháng này. Kiểm tra kết nối rồi thử lại.'
      errorTitle='Không tải được tổng quan'
      isError={isError}
      isLoading={isLoading}
      loadingDescription='Đang đồng bộ số liệu chi tiêu tháng này.'
      loadingTitle='Đang tải tổng quan'
      retryAction={async () => {
        await Promise.all([overviewQuery.refetch(), comparisonQuery.refetch()])
      }}>
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
                : '—'}
            </strong>
          </div>

          <span className='tma-status-pill'>
            {overviewQuery.isFetching || comparisonQuery.isFetching
              ? 'Đang cập nhật'
              : overviewQuery.error || comparisonQuery.error
                ? 'Lỗi dữ liệu'
                : getComparisonLabel(comparison, overview?.expenseCount ?? 0)}
          </span>
        </div>

        <div className='tma-summary-card__meter-meta'>
          <span>{overview?.expenseCount ?? 0} khoản chi</span>
        </div>
      </section>
    </TmaDataState>
  )
}
