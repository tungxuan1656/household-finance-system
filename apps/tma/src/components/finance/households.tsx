import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

// ---- Presentational: pure view, no data fetching ----
export const HouseholdPreviewItem = ({
  card,
  t,
}: {
  card: HouseholdCardViewModel
  t: (key: string, options?: Record<string, unknown>) => string
}) => (
  <Link
    className='block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <Card className='transition active:scale-[0.98]' size='sm'>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <Avatar size='sm'>
            <AvatarImage
              alt={card.household.name}
              src={card.household.avatarUrl ?? undefined}
            />
            <AvatarFallback>
              {resolveInitials(card.household.name)}
            </AvatarFallback>
          </Avatar>
          <Badge className='h-6 shrink-0 px-2.5 py-1.5' variant='secondary'>
            {card.memberCount != null
              ? `${card.memberCount}`
              : t('householdsList.loading')}
            <span aria-hidden className='ml-1 inline-flex'>
              {/* subtle user icon via text, keep lightweight */}•
            </span>
          </Badge>
        </div>
        <CardTitle className='line-clamp-1'>{card.household.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className='block font-mono text-sm font-medium text-foreground [font-variant-numeric:tabular-nums]'>
          {card.totalSpendMinor != null && card.currencyCode
            ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
            : card.isLoading
              ? t('householdsList.loadingDots')
              : '-'}
        </span>
        {card.budget ? (
          <Badge className='mt-2 max-w-full' variant='secondary'>
            <span className='truncate'>{card.budgetLabel}</span>
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  </Link>
)

// ---- Container: owns queries per household, keeps parent clean ----
const HouseholdPreviewCard = ({ household }: { household: HouseholdDTO }) => {
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const budgetPeriod = getMonthBudgetPeriod(selectedPeriod)

  const memberQuery = useQuery(householdMembersQueryOptions(household.id))
  const overviewQuery = useQuery(
    analyticsOverviewQueryOptions(
      toAnalyticsRangeParams(selectedPeriod, household.id),
    ),
  )
  const budgetQuery = useQuery(
    budgetListQueryOptions({
      householdId: household.id,
      period: budgetPeriod,
    }),
  )

  const budget = budgetQuery.data?.items[0] ?? null
  const overview = overviewQuery.data

  const card: HouseholdCardViewModel = {
    household,
    budget,
    budgetLabel: isMonthPeriodSelection(selectedPeriod)
      ? getHouseholdBudgetLabel(overview?.totalSpendMinor, budget, t)
      : t('summary.monthlyOnly'),
    currencyCode: overview?.currencyCode,
    isError: Boolean(
      memberQuery.error || overviewQuery.error || budgetQuery.error,
    ),
    isLoading: Boolean(
      memberQuery.isLoading || overviewQuery.isLoading || budgetQuery.isLoading,
    ),
    memberCount: memberQuery.data?.items.length,
    overview,
    totalSpendMinor: overview?.totalSpendMinor,
  }

  return <HouseholdPreviewItem card={card} t={t} />
}

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
    className='block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
    to={getHouseholdDetailPath(card.household.id)}
    onClick={() => impact('light')}>
    <Card className='flex transition active:scale-[0.99]'>
      <div className='w-full'>
        <CardHeader>
          <div className='flex items-center justify-between gap-3'>
            <Avatar size='lg'>
              <AvatarImage
                alt={card.household.name}
                src={card.household.avatarUrl ?? undefined}
              />
              <AvatarFallback>
                {resolveInitials(card.household.name)}
              </AvatarFallback>
            </Avatar>
            <Badge variant='default'>{roleLabel}</Badge>
          </div>
          <CardTitle className='line-clamp-1'>{card.household.name}</CardTitle>
          <CardDescription>
            {card.memberCount != null
              ? t('households.memberCountMany', { count: card.memberCount })
              : t('householdsList.membersLoading')}
          </CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-2.5'>
          <div className='grid gap-1 rounded-lg bg-muted/50 p-3'>
            <span className='font-mono text-sm font-bold text-foreground [font-variant-numeric:tabular-nums]'>
              {card.totalSpendMinor != null && card.currencyCode
                ? formatCurrencyMinor(card.totalSpendMinor, card.currencyCode)
                : card.isLoading
                  ? t('householdsList.loadingDots')
                  : '-'}
            </span>
            <span className='text-xs text-muted-foreground'>
              {t('householdsList.spent', { defaultValue: 'Spent' })}
            </span>
          </div>
          <div className='grid gap-1 rounded-lg bg-muted/50 p-3'>
            {card.budget ? (
              <>
                <strong className='truncate text-sm text-foreground'>
                  {card.budgetLabel}
                </strong>
                <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/8 dark:bg-white/10'>
                  <div
                    className='h-full rounded-full bg-emerald-500 transition-all'
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
              <strong className='text-sm text-muted-foreground'>—</strong>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  </Link>
)

export const HouseholdPreviewCarousel = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()

  return (
    // No external margin: parent gap owns spacing. Plain wrapper.
    <section
      aria-label={t('householdsList.title', {
        defaultValue: 'Households',
      })}
      className='flex flex-col gap-3'>
      <QueryState
        empty={{
          title: t('householdsList.emptyTitle'),
          description: t('householdsList.emptyDesc'),
        }}
        error={{
          title: t('householdsList.loadError'),
          description: t('householdsList.loadErrorDesc'),
        }}
        isEmpty={(data) => (data?.items?.length ?? 0) === 0}
        pending={{
          title: t('householdsList.loadingTitle'),
          description: t('householdsList.loadingDesc'),
        }}
        query={householdsQuery}
        variant='card'>
        {(data) => {
          const households = data.items

          return (
            // Edge-bleed carousel: -mx-4 compensates TmaPageShell px-4, px-4 + scroll-px-4 aligns snap
            <div className='-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {households.map((household) => (
                <div
                  key={household.id}
                  className='w-[78%] max-w-[300px] min-w-[220px] shrink-0 snap-start'>
                  <HouseholdPreviewCard household={household} />
                </div>
              ))}
            </div>
          )
        }}
      </QueryState>
    </section>
  )
}
