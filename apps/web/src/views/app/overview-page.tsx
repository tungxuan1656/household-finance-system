'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { EmptyState } from '@/components/home/empty-state'
import { HeroStatsCard } from '@/components/home/hero-stats-card'
import { PageShell } from '@/components/ui/page-shell'
import { useAnalyticsComparisonQuery } from '@/hooks/api/use-analytics'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useExpenseSummaryQuery } from '@/hooks/api/use-expense'
import { householdActions } from '@/stores/household.store'
import { useHouseholdStore } from '@/stores/household.store'
import { getDaysRemaining } from '@/utils/datetime/format'
import { OverviewCategoryStatisticsSection } from '@/views/app/overview/overview-category-statistics-section'
import { getCurrentPeriod } from '@/views/app/overview/overview-formatters'
import { OverviewRecentExpensesSection } from '@/views/app/overview/overview-recent-expenses-section'
import type { Lens } from '@/views/app/overview/overview-tabs'
import { OverviewTabs } from '@/views/app/overview/overview-tabs'

function OverviewPage() {
  const households = useHouseholdStore.use.households()
  const householdsLoading = useHouseholdStore.use.isLoading()
  const period = getCurrentPeriod()

  // ── Lens state ──────────────────────────────────────────────────
  const [activeLens, setActiveLens] = useState<Lens>({ type: 'personal' })

  // ── Derived values ──────────────────────────────────────────────
  const householdId =
    activeLens.type === 'household' ? activeLens.householdId : undefined

  const lenses = useMemo<Lens[]>(() => {
    const list: Lens[] = [{ type: 'personal' }]
    for (const h of households) {
      list.push({
        type: 'household',
        householdId: h.id,
        householdName: h.name,
      })
    }

    return list
  }, [households])

  const handleLensChange = useCallback(
    (value: string) => {
      if (value === 'personal') {
        setActiveLens({ type: 'personal' })

        return
      }

      const lens = lenses.find(
        (item): item is Extract<Lens, { type: 'household' }> =>
          item.type === 'household' && item.householdId === value,
      )
      if (lens) setActiveLens(lens)
    },
    [lenses],
  )

  useEffect(() => {
    if (households.length === 0 && !householdsLoading) {
      void householdActions.fetchHouseholds()
    }
  }, [householdActions, households.length, householdsLoading])

  // Keep active lens in sync if selected household is removed
  useEffect(() => {
    if (activeLens.type === 'household') {
      const stillExists = households.some(
        (h) => h.id === activeLens.householdId,
      )
      if (!stillExists) {
        setActiveLens({ type: 'personal' })
      }
    }
  }, [activeLens, households])

  // ── Queries ─────────────────────────────────────────────────────
  const overviewQuery = useAnalyticsOverviewQuery({
    period,
    household_id: householdId,
  })
  const comparisonQuery = useAnalyticsComparisonQuery({
    period,
    household_id: householdId,
  })
  const budgetListQuery = useBudgetListQuery(householdId)
  const expenseSummaryQuery = useExpenseSummaryQuery(
    householdId ? { household_id: householdId } : undefined,
  )

  // ── Derived data ────────────────────────────────────────────────
  const overviewData = overviewQuery.data
  const comparisonData = comparisonQuery.data
  const isExpensesEmpty =
    expenseSummaryQuery.data?.expenseCount === 0 &&
    !expenseSummaryQuery.isLoading

  const isEntirelyEmpty =
    isExpensesEmpty &&
    (budgetListQuery.data?.items.length ?? 0) === 0 &&
    !budgetListQuery.isLoading &&
    !overviewQuery.isLoading

  // ── Empty state guard ──────────────────────────────────────────
  if (isEntirelyEmpty) {
    return (
      <PageShell title='Home'>
        <div className='px-4 pt-4 md:px-6 lg:px-8'>
          <OverviewTabs
            lenses={lenses}
            value={
              activeLens.type === 'personal'
                ? 'personal'
                : activeLens.householdId
            }
            onValueChange={handleLensChange}
          />
        </div>
        <div className='px-4 py-6 md:px-6 md:py-8 lg:px-8'>
          <EmptyState
            onAddFirstExpense={() => {
              // FAB handles quick-add globally; empty state CTA does nothing for now
            }}
          />
        </div>
      </PageShell>
    )
  }

  // ── Main layout ─────────────────────────────────────────────────
  return (
    <PageShell title='Home'>
      <OverviewTabs
        lenses={lenses}
        value={
          activeLens.type === 'personal' ? 'personal' : activeLens.householdId
        }
        onValueChange={handleLensChange}
      />
      <div className='mt-4 flex flex-col gap-6 md:gap-8'>
        {/* Hero Stats */}
        <HeroStatsCard
          budgetLimitMinor={budgetListQuery.data?.items?.[0]?.totalLimitMinor}
          currencyCode={overviewData?.currencyCode ?? 'VND'}
          daysRemaining={getDaysRemaining()}
          error={overviewQuery.error}
          isLoading={overviewQuery.isLoading}
          period={period}
          previousTotalSpendMinor={
            comparisonData?.previousPeriod?.totalSpendMinor
          }
          totalSpendMinor={overviewData?.totalSpendMinor ?? 0}
          onPeriodChange={() => {
            /* period selector TBD */
          }}
          onRetry={() => overviewQuery.refetch()}
        />

        <OverviewRecentExpensesSection householdId={householdId} />

        <OverviewCategoryStatisticsSection
          householdId={householdId}
          period={period}
        />
      </div>
    </PageShell>
  )
}

export { OverviewPage }
