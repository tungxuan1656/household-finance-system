'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { PageShell } from '@/components/ui/page-shell'
import { useBudgetListQuery } from '@/features/budgets/hooks/use-budgets'
import { useExpenseSummaryQuery } from '@/features/expenses/hooks/use-expense'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
} from '@/features/insights/api/use-analytics'
import { EmptyState } from '@/features/overview/components/empty-state'
import { HeroStatsCard } from '@/features/overview/components/hero-stats-card'
import { OverviewCategoryStatisticsSection } from '@/features/overview/components/overview-category-statistics-section'
import { OverviewRecentExpensesSection } from '@/features/overview/components/overview-recent-expenses-section'
import type { View } from '@/features/overview/components/overview-tabs'
import { OverviewTabs } from '@/features/overview/components/overview-tabs'
import { getCurrentPeriod } from '@/features/overview/utils/overview-formatters'
import { PATHS } from '@/lib/constants/paths'
import { useHouseholdStore } from '@/stores/household.store'
import { getDaysRemaining } from '@/utils/datetime/format'

function OverviewPage() {
  const households = useHouseholdStore.use.households()
  const period = getCurrentPeriod()

  const [activeView, setActiveView] = useState<View>({ type: 'personal' })

  const householdId =
    activeView.type === 'household' ? activeView.householdId : undefined

  const views = useMemo<View[]>(() => {
    const list: View[] = [{ type: 'personal' }]
    for (const h of households) {
      list.push({ type: 'household', householdId: h.id, householdName: h.name })
    }

    return list
  }, [households])

  const handleViewChange = useCallback(
    (value: string) => {
      if (value === 'personal') {
        setActiveView({ type: 'personal' })

        return
      }

      const view = views.find(
        (item): item is Extract<View, { type: 'household' }> =>
          item.type === 'household' && item.householdId === value,
      )
      if (view) setActiveView(view)
    },
    [views],
  )

  useEffect(() => {
    if (activeView.type === 'household') {
      const stillExists = households.some(
        (h) => h.id === activeView.householdId,
      )
      if (!stillExists) setActiveView({ type: 'personal' })
    }
  }, [activeView, households])

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

  if (isEntirelyEmpty) {
    return (
      <PageShell title='Home'>
        <OverviewTabs
          value={
            activeView.type === 'personal' ? 'personal' : activeView.householdId
          }
          views={views}
          onValueChange={handleViewChange}
        />
        <div className='mt-6 md:mt-8'>
          <EmptyState addExpenseHref={PATHS.EXPENSES} />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title='Home'>
      <OverviewTabs
        value={
          activeView.type === 'personal' ? 'personal' : activeView.householdId
        }
        views={views}
        onValueChange={handleViewChange}
      />
      <div className='mt-4 flex flex-col gap-6 md:gap-8'>
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
