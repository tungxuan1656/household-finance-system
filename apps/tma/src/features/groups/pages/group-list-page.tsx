import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { type QueryLike, QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'
import { getGroupDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '../api'
import {
  getGroupBudgetLabel,
  getGroupContextLabel,
  getGroupDateRangeLabel,
  getGroupProgress,
  getGroupStatusLabel,
} from '../presentation'
import type { ExpenseGroupDTO, GroupListItem } from '../types'

// ── glyph ────────────────────────────────────────────────────────────
const GroupGlyph = () => (
  <svg
    aria-hidden
    fill='none'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='20'>
    <circle cx='9' cy='9' r='2.5' />
    <circle cx='16.5' cy='10' r='2' />
    <path d='M5.5 17c.8-2 2.3-3 4.5-3s3.7 1 4.5 3' />
    <path d='M14.5 17c.4-1.3 1.4-2.1 3-2.4' />
  </svg>
)

// ── helpers ──────────────────────────────────────────────────────────
const buildGroupListItems = (
  personalGroups: ExpenseGroupDTO[],
  householdGroupsByHousehold: Array<{
    groups: ExpenseGroupDTO[]
    household: HouseholdDTO
  }>,
): GroupListItem[] => [
  ...personalGroups.map((group) => ({ group, household: null })),
  ...householdGroupsByHousehold.flatMap(({ groups, household }) =>
    groups.map((group) => ({ group, household })),
  ),
]

// ── subcomponents (mobile-first, no margin, parent gap owns rhythm) ─

const GroupStats = ({ item }: { item: GroupListItem }) => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='grid gap-1'>
        <CardDescription>{t('groups.statSpent')}</CardDescription>
        <span className='text-sm font-bold text-foreground tabular-nums'>
          {formatCurrencyMinor(item.group.totalSpendMinor, 'VND')}
        </span>
      </div>
      <div className='grid gap-1'>
        <CardDescription>{t('groups.statBudget')}</CardDescription>
        <p className='text-sm font-semibold text-foreground tabular-nums'>
          {getGroupBudgetLabel(item.group, t)}
        </p>
      </div>
    </div>
  )
}

const GroupProgressBar = ({
  progress,
}: {
  progress: NonNullable<ReturnType<typeof getGroupProgress>>
}) => {
  const { t } = useTranslation()

  return (
    <div className='grid gap-1.5'>
      <div className='h-2 overflow-hidden rounded-full bg-muted'>
        <div
          className={
            progress.isOverBudget
              ? 'h-full rounded-full bg-destructive'
              : 'h-full rounded-full bg-primary'
          }
          style={{ width: `${progress.widthPercent}%` }}
        />
      </div>
      <CardDescription className='text-xs'>
        {t('groups.statBudgetUsedPct', { percent: progress.percentUsed })}
      </CardDescription>
    </div>
  )
}

const GroupListCard = ({ item }: { item: GroupListItem }) => {
  const { t } = useTranslation()
  const progress = getGroupProgress(
    item.group.totalSpendMinor,
    item.group.eventBudgetMinor,
  )

  return (
    <Link
      className='block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
      to={getGroupDetailPath(item.group.id)}
      onClick={() => impact('light')}>
      <Card
        className='transition-colors hover:bg-muted/40 active:scale-[0.995] active:bg-muted/60'
        size='sm'>
        <CardHeader className='gap-3'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <GroupGlyph />
            </div>
            <Badge
              variant={
                item.group.status === 'active' ? 'secondary' : 'outline'
              }>
              {getGroupStatusLabel(item.group.status, t)}
            </Badge>
          </div>
          <div className='grid min-w-0 gap-1'>
            <CardTitle className='truncate text-base font-bold tracking-tight normal-case'>
              {item.group.name}
            </CardTitle>
            <CardDescription className='line-clamp-2'>
              {item.group.description || getGroupContextLabel(item, t)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='grid gap-3'>
          <GroupStats item={item} />
          {progress ? <GroupProgressBar progress={progress} /> : null}
          <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
            <span className='min-w-0 truncate'>
              {getGroupContextLabel(item, t)}
            </span>
            <span className='shrink-0 tabular-nums'>
              {getGroupDateRangeLabel(item.group, t)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ── page ─────────────────────────────────────────────────────────────

export const GroupListPage = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  // raw items (unsorted) — sorting happens inside QueryState children to avoid
  // memo churn and keep semantics identical to budget-list-page pattern
  const rawGroupItems = useMemo(
    () =>
      buildGroupListItems(
        personalGroupsQuery.data?.items ?? [],
        households.map((household, index) => ({
          household,
          groups: householdGroupQueries[index]?.data?.items ?? [],
        })),
      ),
    [households, householdGroupQueries, personalGroupsQuery.data?.items],
  )

  // Composite QueryLike that merges 3 query families (households + personal + household groups)
  // Mirrors expense-filter-page groupsQuery memo pattern.
  const groupListQuery = useMemo<QueryLike<GroupListItem[]>>(() => {
    const queries = [
      householdsQuery as unknown as QueryLike<unknown>,
      personalGroupsQuery as unknown as QueryLike<unknown>,
      ...(householdGroupQueries as unknown as QueryLike<unknown>[]),
    ]

    const hasError = queries.some((q) => q.status === 'error')
    const isPending = queries.some((q) => q.status === 'pending')
    const isFetching = queries.some((q) => q.fetchStatus === 'fetching')

    const refetchAll = () => {
      void householdsQuery.refetch?.()
      void personalGroupsQuery.refetch?.()

      householdGroupQueries.forEach((q) => {
        void (q.refetch as (() => unknown) | undefined)?.()
      })
    }

    if (hasError) {
      return {
        status: 'error',
        fetchStatus: isFetching ? 'fetching' : 'idle',
        data: undefined,
        refetch: refetchAll,
      }
    }

    if (isPending) {
      return {
        status: 'pending',
        fetchStatus: 'fetching',
        data: undefined,
        refetch: refetchAll,
      }
    }

    return {
      status: 'success',
      fetchStatus: isFetching ? 'fetching' : 'idle',
      data: rawGroupItems,
      refetch: refetchAll,
    }
  }, [
    householdsQuery,
    personalGroupsQuery,
    householdGroupQueries,
    rawGroupItems,
  ])

  const handleRefetch = async () => {
    await Promise.all([
      householdsQuery.refetch(),
      personalGroupsQuery.refetch(),
      ...householdGroupQueries.map((q) => q.refetch()),
    ])
  }

  // hero count — derived from composite success data, fallback 0 while pending
  const totalCount =
    groupListQuery.status === 'success' ? (groupListQuery.data?.length ?? 0) : 0

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      title={t('groups.title')}
      onRefresh={handleRefetch}>
      {/* Hero count card — compact on mobile via size="sm", synchronized gap */}
      <Card size='sm'>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div className='grid gap-1'>
              <CardDescription>{t('groups.title')}</CardDescription>
              <CardTitle className='text-2xl leading-none font-extrabold tabular-nums'>
                {totalCount}
              </CardTitle>
            </div>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <GroupGlyph />
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='m-0 text-sm font-bold tracking-tight'>
            {t('groups.header')}
          </h2>
          <Link
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            to={TMA_PATHS.groupsNew}
            onClick={() => impact('light')}>
            {t('groups.create')}
          </Link>
        </div>

        <QueryState
          empty={{
            title: t('groups.emptyTitle'),
            description: t('groups.emptyDesc'),
            action: (
              <Link
                className={buttonVariants({
                  size: 'sm',
                  variant: 'secondary',
                })}
                to={TMA_PATHS.groupsNew}
                onClick={() => impact('light')}>
                {t('groups.createTitle')}
              </Link>
            ),
          }}
          error={{
            title: t('groups.loadError'),
            description: t('groups.loadErrorDesc'),
          }}
          isEmpty={(data) => data.length === 0}
          pending={{
            title: t('groups.loadingTitle'),
            description: t('groups.loadingDesc'),
          }}
          query={groupListQuery}
          retryAction={handleRefetch}
          variant='card'>
          {(items) => {
            const sorted = [...items].sort(
              (a, b) => b.group.createdAt - a.group.createdAt,
            )

            return (
              <div className='grid gap-3'>
                {sorted.map((item) => (
                  <GroupListCard key={item.group.id} item={item} />
                ))}
              </div>
            )
          }}
        </QueryState>
      </section>
    </TmaPageShell>
  )
}
