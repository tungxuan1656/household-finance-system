import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'
import { getGroupDetailPath, TMA_PATHS } from '@/lib/constants/routes'

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

const GroupGlyph = () => (
  <svg
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

const GroupListCard = ({
  item,
  t,
}: {
  item: GroupListItem
  t: (key: string, options?: Record<string, unknown>) => string
}) => {
  const progress = getGroupProgress(
    item.group.totalSpendMinor,
    item.group.eventBudgetMinor,
  )

  return (
    <Link
      className='grid gap-3 rounded-3xl bg-white p-4 shadow-md transition active:scale-[0.99]'
      to={getGroupDetailPath(item.group.id)}>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex size-10 items-center justify-center rounded-full bg-[#fff3e8] text-[#ff8a3d]'>
          <GroupGlyph />
        </div>
        <Badge
          variant={item.group.status === 'active' ? 'secondary' : 'outline'}>
          {getGroupStatusLabel(item.group.status, t)}
        </Badge>
      </div>

      <div className='min-w-0'>
        <CardTitle className='truncate'>{item.group.name}</CardTitle>
        <CardDescription className='mt-1 line-clamp-2'>
          {item.group.description || getGroupContextLabel(item, t)}
        </CardDescription>
      </div>

      <div className='grid grid-cols-2 gap-2.5'>
        <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
          <span className='text-xs font-medium text-muted-foreground'>
            {t('groups.statSpent')}
          </span>
          <span className='text-sm font-bold text-foreground'>
            {formatCurrencyMinor(item.group.totalSpendMinor, 'VND')}
          </span>
        </div>
        <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
          <span className='text-xs font-medium text-muted-foreground'>
            {t('groups.statBudget')}
          </span>
          <strong className='text-sm text-foreground'>
            {getGroupBudgetLabel(item.group, t)}
          </strong>
        </div>
      </div>

      {progress ? (
        <div className='grid gap-1.5'>
          <div className='h-2 overflow-hidden rounded-full bg-black/6'>
            <div
              className={
                progress.isOverBudget
                  ? 'h-full rounded-full bg-[#d93838]'
                  : 'h-full rounded-full bg-primary'
              }
              style={{ width: `${progress.widthPercent}%` }}
            />
          </div>
          <CardDescription>
            {t('groups.statBudgetUsedPct', { percent: progress.percentUsed })}
          </CardDescription>
        </div>
      ) : null}

      <div className='flex items-center justify-between gap-3 text-sm text-muted-foreground'>
        <span className='truncate'>{getGroupContextLabel(item, t)}</span>
        <span className='shrink-0'>
          {getGroupDateRangeLabel(item.group, t)}
        </span>
      </div>
    </Link>
  )
}

export const GroupListPage = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const groupItems = useMemo(
    () =>
      buildGroupListItems(
        personalGroupsQuery.data?.items ?? [],
        households.map((household, index) => ({
          household,
          groups: householdGroupQueries[index]?.data?.items ?? [],
        })),
      ).sort((left, right) => right.group.createdAt - left.group.createdAt),
    [householdGroupQueries, households, personalGroupsQuery.data?.items],
  )

  const isInitialLoading =
    groupItems.length === 0 &&
    (householdsQuery.isLoading ||
      personalGroupsQuery.isLoading ||
      householdGroupQueries.some((query) => query.isLoading))
  const isInitialError =
    groupItems.length === 0 &&
    (householdsQuery.isError ||
      personalGroupsQuery.isError ||
      householdGroupQueries.some((query) => query.isError))

  return (
    <TmaPageShell title={t('groups.title')}>
      <Card className='grid gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <strong className='mt-1 block text-[30px] leading-none font-extrabold text-foreground'>
              {groupItems.length}
            </strong>
          </div>
          <div className='flex size-10 items-center justify-center rounded-full bg-[#fff3e8] text-[#ff8a3d]'>
            <GroupGlyph />
          </div>
        </div>
      </Card>

      <section className='grid gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='m-0 text-base font-bold'>{t('groups.header')}</h2>
          {groupItems.length > 0 ? (
            <Link
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
              to={TMA_PATHS.groupsNew}>
              {t('groups.create')}
            </Link>
          ) : null}
        </div>

        <DataState
          customAction={
            groupItems.length === 0 && !isInitialLoading ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.groupsNew}>
                {t('groups.createTitle')}
              </Link>
            ) : null
          }
          emptyDescription={t('groups.emptyDesc')}
          emptyTitle={t('groups.emptyTitle')}
          errorDescription={t('groups.loadErrorDesc')}
          errorTitle={t('groups.loadError')}
          isEmpty={
            !isInitialLoading && !isInitialError && groupItems.length === 0
          }
          isError={isInitialError}
          isLoading={isInitialLoading}
          loadingDescription={t('groups.loadingDesc')}
          loadingTitle={t('groups.loadingTitle')}
          retryAction={async () => {
            await Promise.all([
              householdsQuery.refetch(),
              personalGroupsQuery.refetch(),
              ...householdGroupQueries.map((query) => query.refetch()),
            ])
          }}>
          <div className='grid gap-3'>
            {groupItems.map((item) => (
              <GroupListCard key={item.group.id} item={item} t={t} />
            ))}
          </div>
        </DataState>
      </section>
    </TmaPageShell>
  )
}
