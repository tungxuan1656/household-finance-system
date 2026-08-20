import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HouseholdItem } from '@/components/finance'
import { DataState } from '@/components/shared/data-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      <Card>
        <CardHeader>
          <CardDescription>{t('households.thisMonth')}</CardDescription>
          <CardTitle className='text-[30px] leading-none font-extrabold'>
            {householdCards.length}
          </CardTitle>
        </CardHeader>
      </Card>

      <section className='grid gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='mt-4 text-base font-bold'>{t('households.header')}</h2>
          <div>
            {householdCards.length > 0 ? (
              <TmaHapticButton size='sm' variant='secondary'>
                <Link to={TMA_PATHS.householdsNew}>
                  {t('households.create')}
                </Link>
              </TmaHapticButton>
            ) : null}
          </div>
        </div>

        <DataState
          customAction={
            householdCards.length === 0 && !householdsQuery.isLoading ? (
              <TmaHapticButton size='sm' variant='secondary'>
                <Link to={TMA_PATHS.householdsNew}>
                  {t('households.createTitle')}
                </Link>
              </TmaHapticButton>
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
