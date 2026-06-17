import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HouseholdItem } from '@/components/finance'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  DataState,
  Eyebrow,
  Section,
  SectionHeader,
} from '@/components/ui'
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
            <Eyebrow>{t('households.thisMonth')}</Eyebrow>
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
                {t('households.create')}
              </Link>
            ) : null
          }
          title={t('households.header')}
        />

        <DataState
          customAction={
            householdCards.length === 0 && !householdsQuery.isLoading ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.householdsNew}
                onClick={() => impact('light')}>
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
      </Section>
    </TmaPageShell>
  )
}
