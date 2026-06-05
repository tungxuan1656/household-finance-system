import { useQuery } from '@tanstack/react-query'

import { Card, Chip, DataState, Eyebrow, MoneyLabel } from '@/components/ui'
import {
  budgetListQueryOptions,
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getBudgetProgress,
  getComparisonLabel,
  getHouseholdBudgetLabel,
} from '@/features/home/presentation'
import { getCurrentPeriod } from '@/lib/period'

export const FinanceSummaryCard = ({
  householdId,
  period = getCurrentPeriod(),
  title = 'Tổng chi tháng này',
}: {
  householdId?: string
  period?: string
  title?: string
}) => {
  const overviewParams = householdId
    ? { household_id: householdId, period }
    : { period }
  const overviewQuery = useAnalyticsOverviewQuery(overviewParams)
  const comparisonQuery = useAnalyticsComparisonQuery(overviewParams)
  const budgetQuery = useQuery({
    ...budgetListQueryOptions(householdId ?? 'unknown', period),
    enabled: Boolean(householdId),
  })
  const overview = overviewQuery.data
  const budget = budgetQuery.data?.items[0] ?? null
  const budgetProgress = overview
    ? getBudgetProgress(overview.totalSpendMinor, budget)
    : null
  const isLoading =
    !overview &&
    (overviewQuery.isLoading ||
      comparisonQuery.isLoading ||
      budgetQuery.isLoading)
  const isError =
    !overview && Boolean(overviewQuery.error || comparisonQuery.error)

  return (
    <DataState
      errorDescription='Không tải được tổng quan tháng này. Kiểm tra kết nối rồi thử lại.'
      errorTitle='Không tải được tổng quan'
      isError={isError}
      isLoading={isLoading}
      loadingDescription='Đang đồng bộ số liệu chi tiêu tháng này.'
      loadingTitle='Đang tải tổng quan'
      retryAction={async () => {
        await Promise.all([
          overviewQuery.refetch(),
          comparisonQuery.refetch(),
          budgetQuery.refetch(),
        ])
      }}>
      <Card className='grid gap-4 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <Eyebrow>{title}</Eyebrow>
            <MoneyLabel className='mt-1 block text-[30px] leading-none font-extrabold tracking-normal'>
              {overview
                ? formatCurrencyMinor(
                    overview.totalSpendMinor,
                    overview.currencyCode,
                  )
                : '-'}
            </MoneyLabel>
          </div>
          <Chip tone='primary'>
            {overviewQuery.isFetching || comparisonQuery.isFetching
              ? 'Đang cập nhật'
              : getComparisonLabel(
                  comparisonQuery.data,
                  overview?.expenseCount ?? 0,
                )}
          </Chip>
        </div>

        {budgetProgress ? (
          <div className='grid gap-2'>
            <div className='h-3 overflow-hidden rounded-full bg-black/[0.07]'>
              <span
                className='block h-full rounded-full bg-gradient-to-r from-tma-primary to-[#7ca8ff] shadow-[0_6px_14px_rgba(63,124,255,0.22)]'
                style={{
                  width: `${Math.min(budgetProgress.percentUsed, 100)}%`,
                }}
              />
            </div>
            <div className='flex items-center justify-between gap-3 text-xs font-semibold text-tma-text-muted'>
              <span>Đã dùng {budgetProgress.percentUsed}% ngân sách</span>
              <span>
                {budgetProgress.isOverBudget ? 'Vượt ' : 'Còn '}
                <MoneyLabel>
                  {formatCurrencyMinor(
                    Math.abs(budgetProgress.remainingMinor),
                    budget?.currencyCode ?? overview?.currencyCode ?? 'VND',
                  )}
                </MoneyLabel>
              </span>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-between gap-3 text-xs font-semibold text-tma-text-muted'>
            <span>{overview?.expenseCount ?? 0} khoản chi</span>
            <span>
              {budget
                ? getHouseholdBudgetLabel(overview?.totalSpendMinor, budget)
                : 'Tháng hiện tại'}
            </span>
          </div>
        )}
      </Card>
    </DataState>
  )
}
