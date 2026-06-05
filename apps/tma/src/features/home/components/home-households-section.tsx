import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import {
  analyticsOverviewQueryOptions,
  budgetListQueryOptions,
  householdMembersQueryOptions,
  useHouseholdsQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getHouseholdBudgetLabel,
  resolveInitials,
} from '@/features/home/presentation'
import type {
  AnalyticsOverviewDTO,
  BudgetDTO,
  HouseholdDTO,
} from '@/features/home/types'
import { getHouseholdDetailPath } from '@/lib/constants/routes'
import { getCurrentPeriod } from '@/lib/period'
import { impact } from '@/lib/telegram/haptics'

interface HouseholdCardViewModel {
  household: HouseholdDTO
  budget: BudgetDTO | null
  currencyCode?: string
  isError: boolean
  isLoading: boolean
  memberCount?: number
  overview?: AnalyticsOverviewDTO
  totalSpendMinor?: number
}

export const HomeHouseholdsSection = () => {
  const period = getCurrentPeriod()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []

  const householdMemberQueries = useQueries({
    queries: households.map((household) =>
      householdMembersQueryOptions(household.id),
    ),
  })
  const householdOverviewQueries = useQueries({
    queries: households.map((household) =>
      analyticsOverviewQueryOptions({
        household_id: household.id,
        period,
      }),
    ),
  })
  const householdBudgetQueries = useQueries({
    queries: households.map((household) =>
      budgetListQueryOptions(household.id, period),
    ),
  })

  const householdCards: HouseholdCardViewModel[] = households
    .map((household, index) => {
      const membersQuery = householdMemberQueries[index]
      const overviewQuery = householdOverviewQueries[index]
      const budgetQuery = householdBudgetQueries[index]

      return {
        household,
        budget: budgetQuery?.data?.items[0] ?? null,
        currencyCode: overviewQuery?.data?.currencyCode,
        isError: Boolean(
          membersQuery?.error || overviewQuery?.error || budgetQuery?.error,
        ),
        isLoading: Boolean(
          membersQuery?.isLoading ||
          overviewQuery?.isLoading ||
          budgetQuery?.isLoading,
        ),
        memberCount: membersQuery?.data?.items.length,
        overview: overviewQuery?.data,
        totalSpendMinor: overviewQuery?.data?.totalSpendMinor,
      }
    })
    .sort(
      (left, right) =>
        (right.totalSpendMinor ?? Number.NEGATIVE_INFINITY) -
        (left.totalSpendMinor ?? Number.NEGATIVE_INFINITY),
    )

  return (
    <section className='tma-section'>
      <div className='tma-section__header'>
        <h2 className='tma-section__title'>Gia đình</h2>
      </div>

      {householdsQuery.isError ? (
        <div className='tma-empty-card'>
          <h2>Không tải được danh sách gia đình</h2>
          <p>
            Kiểm tra phiên đăng nhập hoặc dữ liệu seed local rồi mở lại Mini
            App.
          </p>
        </div>
      ) : householdsQuery.isLoading ? (
        <div className='tma-empty-card'>
          <h2>Đang tải danh sách gia đình</h2>
          <p>
            Thẻ household sẽ xuất hiện ngay khi các truy vấn đầu tiên hoàn tất.
          </p>
        </div>
      ) : householdCards.length === 0 ? (
        <div className='tma-empty-card'>
          <h2>Chưa tham gia gia đình nào</h2>
          <p>
            Home vẫn hiển thị chi tiêu cá nhân, còn thẻ gia đình sẽ xuất hiện
            khi có membership.
          </p>
        </div>
      ) : (
        <div className='tma-household-carousel'>
          {householdCards.map((householdCard) => (
            <Link
              key={householdCard.household.id}
              className='tma-household-card'
              to={getHouseholdDetailPath(householdCard.household.id)}
              onClick={() => impact('light')}>
              <div className='tma-household-card__top'>
                <div className='tma-household-avatar tma-household-avatar--sm'>
                  {householdCard.household.avatarUrl ? (
                    <img
                      alt={householdCard.household.name}
                      className='tma-avatar-image'
                      src={householdCard.household.avatarUrl}
                    />
                  ) : (
                    <span>{resolveInitials(householdCard.household.name)}</span>
                  )}
                </div>
                <span className='tma-soft-pill'>
                  {householdCard.memberCount != null
                    ? `${householdCard.memberCount} thành viên`
                    : 'Đang tải thành viên'}
                </span>
              </div>

              <div>
                <h3>{householdCard.household.name}</h3>
                <strong className='font-mono'>
                  {householdCard.totalSpendMinor != null &&
                  householdCard.currencyCode
                    ? formatCurrencyMinor(
                        householdCard.totalSpendMinor,
                        householdCard.currencyCode,
                      )
                    : householdCard.isLoading
                      ? 'Đang tải...'
                      : '—'}
                </strong>
              </div>

              <p>
                {householdCard.isError
                  ? 'Không tải được tổng quan gia đình.'
                  : getHouseholdBudgetLabel(
                      householdCard.totalSpendMinor,
                      householdCard.budget,
                    )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
