import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HouseholdItem } from '@/components/finance'
import { DataState } from '@/components/shared/data-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getHouseholdBudgetLabel } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  createCurrentMonthPeriodSelection,
  getMonthBudgetPeriod,
  toAnalyticsRangeParams,
} from '@/lib/period'

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
  const { t } = useTranslation()
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
            t,
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
    <TmaPageShell title={t('households.title')}>
      <Card className='grid gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <span className='text-xs font-medium text-muted-foreground'>
              {t('households.thisMonth')}
            </span>
            <strong className='mt-1 block text-[30px] leading-none font-extrabold text-foreground'>
              {householdCards.length}
            </strong>
          </div>
        </div>
      </Card>

      <section className='grid gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='m-0 text-base font-bold'>{t('households.header')}</h2>
          <div>
            {householdCards.length > 0 ? (
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                to={TMA_PATHS.householdsNew}>
                {t('households.create')}
              </Link>
            ) : null}
          </div>
        </div>

        <DataState
          customAction={
            householdCards.length === 0 && !householdsQuery.isLoading ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.householdsNew}>
                {t('households.createTitle')}
              </Link>
            ) : null
          }
          emptyDescription={t('households.emptyDesc')}
          emptyTitle={t('households.emptyTitle')}
          errorDescription={t('households.loadErrorDesc')}
          errorTitle={t('households.loadError')}
          isEmpty={
            !householdsQuery.isLoading &&
            !householdsQuery.isError &&
            householdCards.length === 0
          }
          isError={householdsQuery.isError && householdCards.length === 0}
          isLoading={householdsQuery.isLoading && householdCards.length === 0}
          loadingDescription={t('households.loadingDesc')}
          loadingTitle={t('households.loadingTitle')}
          retryAction={householdsQuery.refetch}>
          <div className='grid gap-3'>
            {householdCards.map((card) => (
              <HouseholdItem
                key={card.household.id}
                card={card}
                roleLabel={getHouseholdRoleLabel(card.household.role, t)}
                t={t}
              />
            ))}
          </div>
        </DataState>
      </section>
    </TmaPageShell>
  )
}
