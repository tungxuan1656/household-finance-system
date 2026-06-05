import { useMemo } from 'react'

import { TmaDataState } from '@/components/shared/tma-data-state'
import {
  formatCurrencyMinor,
  getBudgetProgress,
} from '@/features/home/presentation'
import { formatPeriodLabel } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'

import {
  useHouseholdBudgetListQuery,
  useHouseholdMembersQuery,
  useHouseholdOverviewQuery,
} from '../api'
import { formatMemberCountLabel } from '../presentation'

type HouseholdOverviewSectionProps = {
  householdId: string
}

export const HouseholdOverviewSection = ({
  householdId,
}: HouseholdOverviewSectionProps) => {
  const period = getCurrentPeriod()
  const overviewQuery = useHouseholdOverviewQuery(householdId, period)
  const budgetQuery = useHouseholdBudgetListQuery(householdId, period)
  const membersQuery = useHouseholdMembersQuery(householdId)

  const overview = overviewQuery.data
  const budget = budgetQuery.data?.items[0] ?? null
  const memberCount = membersQuery.data?.items.length ?? 0
  const memberSummary = useMemo(
    () => formatMemberCountLabel(memberCount),
    [memberCount],
  )

  const isLoading =
    !overview && (overviewQuery.isLoading || budgetQuery.isLoading)
  const isError = !overview && Boolean(overviewQuery.error)

  const budgetProgress = overview
    ? getBudgetProgress(overview.totalSpendMinor, budget)
    : null

  return (
    <TmaDataState
      errorDescription='Tổng quan tháng này đang lỗi. Thử mở lại household hoặc đồng bộ lại.'
      errorTitle='Không tải được tổng quan tháng này'
      isError={isError}
      isLoading={isLoading}
      loadingDescription='Số liệu tháng này sẽ hiện ngay khi truy vấn hoàn tất.'
      loadingTitle='Đang tải tổng quan tháng này'
      retryAction={async () => {
        await Promise.all([overviewQuery.refetch(), budgetQuery.refetch()])
      }}>
      <section className='tma-summary-card'>
        <div className='tma-summary-card__topline'>
          <div>
            <p className='tma-section-label'>Tổng quan tháng này</p>
            <strong className='font-mono-money'>
              {overview
                ? formatCurrencyMinor(
                    overview.totalSpendMinor,
                    overview.currencyCode,
                  )
                : '—'}
            </strong>
          </div>

          <span className='tma-chip tma-chip--strong'>
            {formatPeriodLabel(period)}
          </span>
        </div>

        {budgetProgress ? (
          <div className='tma-summary-card__meter'>
            <div className='tma-summary-card__meter-track'>
              <span
                className='tma-summary-card__meter-fill'
                style={{
                  width: `${Math.min(budgetProgress.percentUsed, 100)}%`,
                }}
              />
            </div>

            <div className='tma-summary-card__meter-meta'>
              <span>Đã dùng {budgetProgress.percentUsed}% ngân sách</span>
              <span>
                {budgetProgress.isOverBudget ? 'Vượt ' : 'Còn '}
                <span className='font-mono-money'>
                  {formatCurrencyMinor(
                    Math.abs(budgetProgress.remainingMinor),
                    budget?.currencyCode ?? overview?.currencyCode ?? 'VND',
                  )}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className='tma-summary-card__meter-meta'>
            <span>{overview?.expenseCount ?? 0} khoản chi</span>
            <span>{memberSummary}</span>
          </div>
        )}
      </section>
    </TmaDataState>
  )
}
