import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { TmaDataState } from '@/components/shared/tma-data-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  formatCurrencyMinor,
  getHouseholdBudgetLabel,
} from '@/features/home/presentation'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatMonthLabel } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'
import { impact } from '@/lib/telegram/haptics'

import {
  useHouseholdBudgetQueries,
  useHouseholdListQuery,
  useHouseholdMemberQueries,
  useHouseholdOverviewQueries,
} from '../api'
import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '../presentation'

export const HouseholdListPage = () => {
  const period = getCurrentPeriod()
  const householdsQuery = useHouseholdListQuery()

  const households = householdsQuery.data?.items ?? []
  const memberQueries = useHouseholdMemberQueries(households)
  const overviewQueries = useHouseholdOverviewQueries(households, period)
  const budgetQueries = useHouseholdBudgetQueries(households, period)

  const householdCards = useMemo(
    () =>
      households.map((household, index) => {
        const memberQuery = memberQueries[index]
        const overviewQuery = overviewQueries[index]
        const budgetQuery = budgetQueries[index]

        return {
          household,
          budget: budgetQuery?.data?.items[0] ?? null,
          currencyCode: overviewQuery?.data?.currencyCode,
          isLoading: Boolean(
            memberQuery?.isLoading ||
            overviewQuery?.isLoading ||
            budgetQuery?.isLoading,
          ),
          memberCount: memberQuery?.data?.items.length ?? 0,
          totalSpendMinor: overviewQuery?.data?.totalSpendMinor,
        }
      }),
    [budgetQueries, households, memberQueries, overviewQueries],
  )

  return (
    <TmaPageShell title='Gia đình'>
      <section className='tma-hero-card tma-household-hub-card'>
        <div className='tma-summary-card__topline'>
          <div>
            <p className='tma-section-label'>Household hub</p>
            <strong>{householdCards.length}</strong>
          </div>

          <span className='tma-chip tma-chip--strong'>
            {formatMonthLabel(new Date())}
          </span>
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Danh sách</p>
            <h2 className='tma-section__title'>Household của bạn</h2>
          </div>

          {householdCards.length > 0 ? (
            <Link
              className='tma-chip-button border'
              to={TMA_PATHS.householdsNew}
              onClick={() => {
                impact('light')
              }}>
              <span className='text-sm'>Tạo mới</span>
            </Link>
          ) : null}
        </div>

        <TmaDataState
          customAction={
            householdCards.length === 0 && !householdsQuery.isLoading ? (
              <Link
                className='tma-action-button tma-action-button--primary'
                to={TMA_PATHS.householdsNew}
                onClick={() => {
                  impact('light')
                }}>
                Tạo household
              </Link>
            ) : null
          }
          emptyDescription='Tạo household đầu tiên để bắt đầu theo dõi chi tiêu chia sẻ trong TMA.'
          emptyTitle='Chưa có household nào'
          errorDescription='Kiểm tra phiên đăng nhập hoặc dữ liệu local rồi thử mở lại trang.'
          errorTitle='Không tải được household'
          isEmpty={
            !householdsQuery.isLoading &&
            !householdsQuery.isError &&
            householdCards.length === 0
          }
          isError={householdsQuery.isError && householdCards.length === 0}
          isLoading={householdsQuery.isLoading && householdCards.length === 0}
          loadingDescription='Danh sách sẽ hiện ngay khi các truy vấn hoàn tất.'
          loadingTitle='Đang tải household'
          retryAction={householdsQuery.refetch}>
          <div className='tma-household-grid'>
            {householdCards.map((card) => (
              <Link
                key={card.household.id}
                className='tma-household-overview-card'
                to={getHouseholdDetailPath(card.household.id)}
                onClick={() => {
                  impact('light')
                }}>
                <div className='tma-household-overview-card__head'>
                  <div className='tma-household-avatar'>
                    {card.household.avatarUrl ? (
                      <img
                        alt={card.household.name}
                        className='tma-avatar-image'
                        src={card.household.avatarUrl}
                      />
                    ) : (
                      <span>
                        {getHouseholdAvatarFallback(card.household.name)}
                      </span>
                    )}
                  </div>

                  <span className='tma-status-pill'>
                    {getHouseholdRoleLabel(card.household.role)}
                  </span>
                </div>

                <div className='tma-household-overview-card__copy'>
                  <h3>{card.household.name}</h3>
                  <p>{formatMemberCountLabel(card.memberCount)}</p>
                </div>

                <div className='tma-household-stat-grid'>
                  <article className='tma-household-stat'>
                    <span>Chi tháng này</span>
                    <strong className='font-mono-money'>
                      {card.totalSpendMinor != null && card.currencyCode
                        ? formatCurrencyMinor(
                            card.totalSpendMinor,
                            card.currencyCode,
                          )
                        : card.isLoading
                          ? 'Đang tải...'
                          : '—'}
                    </strong>
                  </article>

                  <article className='tma-household-stat'>
                    <span>Ngân sách</span>
                    <strong>
                      {getHouseholdBudgetLabel(
                        card.totalSpendMinor,
                        card.budget,
                      )}
                    </strong>
                  </article>
                </div>

                <div className='tma-household-overview-card__foot'>
                  <span>Mở chi tiết</span>
                  <span>{card.household.defaultCurrencyCode}</span>
                </div>
              </Link>
            ))}
          </div>
        </TmaDataState>
      </section>
    </TmaPageShell>
  )
}
