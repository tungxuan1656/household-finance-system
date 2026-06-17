import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  DataState,
  Eyebrow,
  Section,
  SectionHeader,
} from '@/components/ui'
import { HouseholdItem } from '@/features/finance/components'
import { getHouseholdBudgetLabel } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createCurrentMonthPeriodSelection,
  getMonthBudgetPeriod,
  toAnalyticsRangeParams,
} from '@/lib/period'
import { impact } from '@/lib/telegram/haptics'

import {
  useHouseholdBudgetQueries,
  useHouseholdListQuery,
  useHouseholdMemberQueries,
  useHouseholdOverviewQueries,
} from '../api'
import { getHouseholdRoleLabel } from '../presentation'

const currentMonthPeriod = createCurrentMonthPeriodSelection()
const currentMonthAnalyticsParams = toAnalyticsRangeParams(currentMonthPeriod)
const currentMonthBudgetPeriod = getMonthBudgetPeriod(currentMonthPeriod)

export const HouseholdListPage = () => {
  const householdsQuery = useHouseholdListQuery()
  const households = householdsQuery.data?.items ?? []
  const memberQueries = useHouseholdMemberQueries(households)
  const overviewQueries = useHouseholdOverviewQueries(
    households,
    currentMonthAnalyticsParams,
  )
  const budgetQueries = useHouseholdBudgetQueries(
    households,
    currentMonthBudgetPeriod,
  )

  const householdCards = useMemo(
    () =>
      households.map((household, index) => {
        const memberQuery = memberQueries[index]
        const overviewQuery = overviewQueries[index]
        const budgetQuery = budgetQueries[index]

        return {
          household,
          budget: budgetQuery?.data?.items[0] ?? null,
          budgetLabel: getHouseholdBudgetLabel(
            overviewQuery?.data?.totalSpendMinor,
            budgetQuery?.data?.items[0] ?? null,
          ),
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
      <Card className='grid gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <Eyebrow>Tháng này</Eyebrow>
            <strong className='mt-1 block text-[30px] leading-none font-extrabold text-tma-text-strong'>
              {householdCards.length}
            </strong>
          </div>
        </div>
      </Card>

      <Section>
        <SectionHeader
          action={
            householdCards.length > 0 ? (
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                to={TMA_PATHS.householdsNew}
                onClick={() => impact('light')}>
                Tạo mới
              </Link>
            ) : null
          }
          title='Household của bạn'
        />

        <DataState
          customAction={
            householdCards.length === 0 && !householdsQuery.isLoading ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.householdsNew}
                onClick={() => impact('light')}>
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
          <div className='grid gap-3'>
            {householdCards.map((card) => (
              <HouseholdItem
                key={card.household.id}
                card={card}
                roleLabel={getHouseholdRoleLabel(card.household.role)}
              />
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
