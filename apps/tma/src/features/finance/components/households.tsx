import { useQueries } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import {
  Avatar,
  CardDescription,
  CardTitle,
  Chip,
  DataState,
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
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
import { usePeriodStore } from '@/features/period/store'
import { getHouseholdDetailPath } from '@/lib/constants/routes'
import {
  getMonthBudgetPeriod,
  isMonthPeriodSelection,
  toAnalyticsRangeParams,
} from '@/lib/period'
import { impact } from '@/lib/telegram/haptics'

interface HouseholdCardViewModel {
  budget: BudgetDTO | null
  currencyCode?: string
  household: HouseholdDTO
  isError?: boolean
  isLoading?: boolean
  memberCount?: number
  overview?: AnalyticsOverviewDTO
  totalSpendMinor?: number
  budgetLabel: string
}

export const HouseholdPreviewItem = ({
  card,
}: {
  card: HouseholdCardViewModel
}) => (
  <Link
    className='grid min-w-[220px] gap-3 rounded-[22px] bg-white p-3.5 shadow-tma-soft transition active:scale-[0.98]'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <div className='flex items-center justify-between gap-3'>
      <Avatar
        alt={card.household.name}
        fallback={resolveInitials(card.household.name)}
        size='sm'
        src={card.household.avatarUrl}
      />
      <Chip>
        {card.memberCount != null
          ? `${card.memberCount} thành viên`
          : 'Đang tải'}
      </Chip>
    </div>
    <div>
      <h3 className='m-0 text-[15px] font-semibold text-tma-text-strong'>
        {card.household.name}
      </h3>
      <MoneyLabel className='mt-1 block text-sm font-bold'>
        {card.totalSpendMinor != null && card.currencyCode
          ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
          : card.isLoading
            ? 'Đang tải...'
            : '-'}
      </MoneyLabel>
    </div>
    <CardDescription>
      {card.isError ? 'Không tải được tổng quan gia đình.' : card.budgetLabel}
    </CardDescription>
  </Link>
)

export const HouseholdItem = ({
  action,
  card,
  roleLabel,
}: {
  action?: ReactNode
  card: HouseholdCardViewModel
  roleLabel: string
}) => (
  <Link
    className='grid gap-3 rounded-[24px] bg-white p-4 shadow-tma-card transition active:scale-[0.99]'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <div className='flex items-center justify-between gap-3'>
      <Avatar
        alt={card.household.name}
        fallback={resolveInitials(card.household.name)}
        size='lg'
        src={card.household.avatarUrl}
      />
      <Chip tone='primary'>{roleLabel}</Chip>
    </div>
    <div>
      <CardTitle>{card.household.name}</CardTitle>
      <CardDescription>
        {card.memberCount != null
          ? `${card.memberCount} thành viên`
          : 'Đang tải thành viên'}
      </CardDescription>
    </div>
    <div className='grid grid-cols-2 gap-2.5'>
      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
        <Eyebrow>Chi kỳ này</Eyebrow>
        <MoneyLabel className='text-sm font-bold'>
          {card.totalSpendMinor != null && card.currencyCode
            ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
            : card.isLoading
              ? 'Đang tải...'
              : '-'}
        </MoneyLabel>
      </div>
      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
        <Eyebrow>Ngân sách</Eyebrow>
        <strong className='text-sm text-tma-text-strong'>
          {card.budgetLabel}
        </strong>
      </div>
    </div>
    <div className='flex items-center justify-between text-sm text-tma-text-muted'>
      <span>Mở chi tiết</span>
      {action ?? <span>{card.household.defaultCurrencyCode}</span>}
    </div>
  </Link>
)

export const HouseholdPreviewCarousel = () => {
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const budgetPeriod = getMonthBudgetPeriod(selectedPeriod)
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []

  const memberQueries = useQueries({
    queries: households.map((household) =>
      householdMembersQueryOptions(household.id),
    ),
  })
  const overviewQueries = useQueries({
    queries: households.map((household) =>
      analyticsOverviewQueryOptions(
        toAnalyticsRangeParams(selectedPeriod, household.id),
      ),
    ),
  })
  const budgetQueries = useQueries({
    queries: households.map(
      (household) =>
        ({
          ...budgetListQueryOptions(household.id, budgetPeriod ?? 'unknown'),
          enabled: Boolean(budgetPeriod),
        }) as ReturnType<typeof budgetListQueryOptions> & { enabled: boolean },
    ),
  })

  const cards: HouseholdCardViewModel[] = households
    .map((household, index) => ({
      household,
      budget: budgetQueries[index]?.data?.items[0] ?? null,
      budgetLabel:
        budgetPeriod && isMonthPeriodSelection(selectedPeriod)
          ? getHouseholdBudgetLabel(
              overviewQueries[index]?.data?.totalSpendMinor,
              budgetQueries[index]?.data?.items[0] ?? null,
            )
          : 'Ngân sách chỉ có theo tháng',
      currencyCode: overviewQueries[index]?.data?.currencyCode,
      isError: Boolean(
        memberQueries[index]?.error ||
        overviewQueries[index]?.error ||
        budgetQueries[index]?.error,
      ),
      isLoading: Boolean(
        memberQueries[index]?.isLoading ||
        overviewQueries[index]?.isLoading ||
        budgetQueries[index]?.isLoading,
      ),
      memberCount: memberQueries[index]?.data?.items.length,
      overview: overviewQueries[index]?.data,
      totalSpendMinor: overviewQueries[index]?.data?.totalSpendMinor,
    }))
    .sort(
      (left, right) =>
        (right.totalSpendMinor ?? Number.NEGATIVE_INFINITY) -
        (left.totalSpendMinor ?? Number.NEGATIVE_INFINITY),
    )

  return (
    <Section>
      <SectionHeader title='Gia đình' />
      <DataState
        emptyDescription='Home vẫn hiển thị chi tiêu cá nhân, còn thẻ gia đình sẽ xuất hiện khi có membership.'
        emptyTitle='Chưa tham gia gia đình nào'
        errorDescription='Kiểm tra phiên đăng nhập hoặc dữ liệu seed local rồi mở lại Mini App.'
        errorTitle='Không tải được danh sách gia đình'
        isEmpty={
          !householdsQuery.isLoading &&
          !householdsQuery.isError &&
          cards.length === 0
        }
        isError={householdsQuery.isError}
        isLoading={householdsQuery.isLoading && cards.length === 0}
        loadingDescription='Thẻ household sẽ xuất hiện ngay khi các truy vấn đầu tiên hoàn tất.'
        loadingTitle='Đang tải danh sách gia đình'
        retryAction={householdsQuery.refetch}>
        <div className='-mr-1 grid auto-cols-[minmax(220px,78%)] grid-flow-col gap-2.5 overflow-x-auto px-0.5 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {cards.map((card) => (
            <HouseholdPreviewItem key={card.household.id} card={card} />
          ))}
        </div>
      </DataState>
    </Section>
  )
}
