import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { UserIcon } from '@/components/shared/tma-icons'
import {
  Avatar,
  CardDescription,
  CardTitle,
  Chip,
  DataState,
  MoneyLabel,
  Section,
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
  t,
}: {
  card: HouseholdCardViewModel
  t: (key: string, options?: Record<string, unknown>) => string
}) => (
  <Link
    className='grid min-w-55 gap-3 rounded-[22px] bg-white p-3.5 shadow-tma-soft transition active:scale-[0.98]'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <div className='flex items-start justify-between gap-3'>
      <Avatar
        alt={card.household.name}
        fallback={resolveInitials(card.household.name)}
        size='sm'
        src={card.household.avatarUrl}
      />
      <Chip className='min-h-6 px-2.5 py-1.5'>
        {card.memberCount != null
          ? `${card.memberCount}`
          : t('householdsList.loading')}
        <UserIcon className='inline-block size-3' />
      </Chip>
    </div>
    <div>
      <h3 className='m-0 text-[15px] font-semibold text-tma-text-strong'>
        {card.household.name}
      </h3>
      <MoneyLabel className='mt-1 block text-sm font-medium'>
        {card.totalSpendMinor != null && card.currencyCode
          ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
          : card.isLoading
            ? t('householdsList.loadingDots')
            : '-'}
      </MoneyLabel>
    </div>
  </Link>
)

export const HouseholdItem = ({
  card,
  roleLabel,
  t,
}: {
  card: HouseholdCardViewModel
  roleLabel: string
  t: (key: string, options?: Record<string, unknown>) => string
}) => (
  <Link
    className='grid gap-3 rounded-3xl bg-white p-4 shadow-tma-card transition active:scale-[0.99]'
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
          ? t('households.memberCountMany', { count: card.memberCount })
          : t('householdsList.membersLoading')}
      </CardDescription>
    </div>
    <div className='grid grid-cols-2 gap-2.5'>
      <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
        <MoneyLabel className='text-sm font-bold'>
          {card.totalSpendMinor != null && card.currencyCode
            ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
            : card.isLoading
              ? t('householdsList.loadingDots')
              : '-'}
        </MoneyLabel>
      </div>
      <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
        {card.budget ? (
          <>
            <strong className='text-sm text-tma-text-strong'>
              {card.budgetLabel}
            </strong>
            <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/8'>
              <div
                className='h-full rounded-full bg-tma-positive transition-all'
                style={{
                  width: `${Math.min(
                    100,
                    ((card.totalSpendMinor ?? 0) /
                      card.budget.totalLimitMinor) *
                      100,
                  )}%`,
                }}
              />
            </div>
          </>
        ) : (
          <strong className='text-sm text-tma-text-muted'>—</strong>
        )}
      </div>
    </div>
  </Link>
)

export const HouseholdPreviewCarousel = () => {
  const { t } = useTranslation()
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
    queries: households.map((household) =>
      budgetListQueryOptions(household.id, budgetPeriod),
    ),
  })

  const cards: HouseholdCardViewModel[] = households
    .map((household, index) => ({
      household,
      budget: budgetQueries[index]?.data?.items[0] ?? null,
      budgetLabel: isMonthPeriodSelection(selectedPeriod)
        ? getHouseholdBudgetLabel(
            overviewQueries[index]?.data?.totalSpendMinor,
            budgetQueries[index]?.data?.items[0] ?? null,
            t,
          )
        : t('summary.monthlyOnly'),
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
      <DataState
        emptyDescription={t('householdsList.emptyDesc')}
        emptyTitle={t('householdsList.emptyTitle')}
        errorDescription={t('householdsList.loadErrorDesc')}
        errorTitle={t('householdsList.loadError')}
        isEmpty={
          !householdsQuery.isLoading &&
          !householdsQuery.isError &&
          cards.length === 0
        }
        isError={householdsQuery.isError}
        isLoading={householdsQuery.isLoading && cards.length === 0}
        loadingDescription={t('householdsList.loadingDesc')}
        loadingTitle={t('householdsList.loadingTitle')}
        retryAction={householdsQuery.refetch}>
        <div className='-mr-1 grid auto-cols-[minmax(220px,78%)] grid-flow-col gap-2.5 overflow-x-auto px-0.5 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {cards.map((card) => (
            <HouseholdPreviewItem key={card.household.id} card={card} t={t} />
          ))}
        </div>
      </DataState>
    </Section>
  )
}
