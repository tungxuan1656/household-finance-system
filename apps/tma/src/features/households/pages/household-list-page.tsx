import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HouseholdItem } from '@/components/finance'
import { QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getHouseholdBudgetLabel } from '@/features/home/presentation'
import { usePeriodStore } from '@/features/period/store'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  getMonthBudgetPeriod,
  isMonthPeriodSelection,
  toAnalyticsRangeParams,
} from '@/lib/period'
import { impact } from '@/lib/telegram/haptics'

import {
  analyticsOverviewQueryOptions,
  budgetListQueryOptions,
  householdMembersQueryOptions,
  useHouseholdListQuery,
} from '../api'
import { getHouseholdRoleLabel } from '../presentation'
import type { HouseholdDTO } from '../types'

/**
 * Per-household container — owns N*1 queries.
 * Tách khỏi page để tránh N*3 useQueries ở cha + index mapping fragile.
 * Dùng usePeriodStore reactive (thay vì module-level currentMonthPeriod tĩnh).
 * Nếu cần cố định thisMonth, thay bằng useMemo(() => createCurrentMonthPeriodSelection(), [])
 * và document lý do.
 */
function HouseholdListCard({ household }: { household: HouseholdDTO }) {
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
    budgetListQueryOptions(household.id, budgetPeriod),
  )

  const budget = budgetQuery.data?.items[0] ?? null
  const overview = overviewQuery.data

  const card = {
    household,
    budget,
    budgetLabel: isMonthPeriodSelection(selectedPeriod)
      ? getHouseholdBudgetLabel(overview?.totalSpendMinor, budget, t)
      : t('summary.monthlyOnly'),
    currencyCode: overview?.currencyCode,
    isLoading: Boolean(
      memberQuery.isLoading || overviewQuery.isLoading || budgetQuery.isLoading,
    ),
    memberCount: memberQuery.data?.items.length,
    totalSpendMinor: overview?.totalSpendMinor,
  }

  const roleLabel = getHouseholdRoleLabel(household.role, t)

  return <HouseholdItem card={card} roleLabel={roleLabel} t={t} />
}

export const HouseholdListPage = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdListQuery()

  return (
    <TmaPageShell title={t('households.title')}>
      <Card>
        <CardHeader className='gap-1'>
          <CardDescription>{t('households.title')}</CardDescription>
          <CardTitle className='font-mono text-3xl leading-none font-bold tracking-tight normal-case tabular-nums'>
            {householdsQuery.data?.items.length ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <section className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-base font-bold'>{t('households.header')}</h2>
          {householdsQuery.data && householdsQuery.data.items.length > 0 ? (
            <Link
              className={buttonVariants({ size: 'xs' })}
              to={TMA_PATHS.householdsNew}
              onClick={() => impact('light')}>
              {t('households.create')}
            </Link>
          ) : null}
        </div>

        <QueryState
          empty={{
            title: t('households.emptyTitle'),
            description: t('households.emptyDesc'),
            action: (
              <Link
                className={buttonVariants({
                  variant: 'secondary',
                  size: 'sm',
                })}
                to={TMA_PATHS.householdsNew}
                onClick={() => impact('light')}>
                {t('households.createTitle')}
              </Link>
            ),
          }}
          error={{
            title: t('households.loadError'),
            description: t('households.loadErrorDesc'),
          }}
          isEmpty={(data) => (data?.items.length ?? 0) === 0}
          pending={{
            title: t('households.loadingTitle'),
            description: t('households.loadingDesc'),
          }}
          query={householdsQuery}
          variant='card'>
          {(data) => (
            <div className='grid gap-3'>
              {data.items.map((household) => (
                <HouseholdListCard key={household.id} household={household} />
              ))}
            </div>
          )}
        </QueryState>
      </section>
    </TmaPageShell>
  )
}
