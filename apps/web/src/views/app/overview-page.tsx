'use client'

import { useEffect, useMemo, useState } from 'react'

import { EmptyState } from '@/components/home/empty-state'
import { GroupFilterBar } from '@/components/home/group-filter-bar'
import { type GroupInfo } from '@/components/home/group-filter-bar'
import { HeroStatsCard } from '@/components/home/hero-stats-card'
import { HouseholdCardsSection } from '@/components/home/household-cards-section'
import { type HouseholdInfo } from '@/components/home/household-cards-section'
import { LensSelector } from '@/components/home/lens-selector'
import { type Lens } from '@/components/home/lens-selector'
import { RecentExpenses } from '@/components/home/recent-expenses'
import { type RecentExpenseItem } from '@/components/home/recent-expenses'
import { PageShell } from '@/components/ui/page-shell'
import { useAnalyticsComparisonQuery } from '@/hooks/api/use-analytics'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useExpenseSummaryQuery } from '@/hooks/api/use-expense'
import { useInfiniteExpenseListQuery } from '@/hooks/api/use-expense'
import { useExpenseGroupListQuery } from '@/hooks/api/use-groups'
import { useHouseholdStore } from '@/stores/household.store'
import {
  formatCurrency,
  getCurrentPeriod,
} from '@/views/app/overview/overview-formatters'

const RECENT_LIMIT = 5

function getDaysRemaining(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return lastDay.getDate() - now.getDate() + 1
}

function OverviewPage() {
  const households = useHouseholdStore.use.households()
  const period = getCurrentPeriod()

  // ── Lens state ──────────────────────────────────────────────────
  const [activeLens, setActiveLens] = useState<Lens>({ type: 'personal' })
  const [activeGroupIds, setActiveGroupIds] = useState<string[]>([])

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

  const recentExpensesQuery = useInfiniteExpenseListQuery(
    useMemo(
      () => ({
        limit: RECENT_LIMIT,
        sort: 'occurred_at_desc' as const,
        household_id: householdId,
        ...(activeGroupIds.length === 1 ? { group_id: activeGroupIds[0] } : {}),
      }),
      [householdId, activeGroupIds],
    ),
  )

  // Groups for filter bar: fetch for active lens context
  const groupsQuery = useExpenseGroupListQuery(householdId ?? undefined)

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

  // Transform for RecentExpenses
  const recentItems: RecentExpenseItem[] = useMemo(() => {
    const items = recentExpensesQuery.data?.pages?.[0]?.items ?? []

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      categoryKey: item.categoryKey,
      amountMinor: item.amountMinor,
      currencyCode: item.currencyCode,
      occurredAt: item.occurredAt,
      visibility: item.visibility,
    }))
  }, [recentExpensesQuery.data])

  // Transform for HouseholdCardsSection
  const activeHousehold: HouseholdInfo | null = useMemo(() => {
    if (activeLens.type !== 'household') return null

    const h = households.find((hh) => hh.id === activeLens.householdId)
    if (!h) return null

    return {
      id: h.id,
      name: h.name,
      memberCount: 0, // member count to be added when API supports it
      totalSpendMinor: overviewData?.totalSpendMinor ?? 0,
      currencyCode: overviewData?.currencyCode ?? 'VND',
    }
  }, [activeLens, households, overviewData])

  // Available groups for filter bar
  const availableGroupItems: GroupInfo[] = useMemo(
    () =>
      (groupsQuery.data?.items ?? []).map((g) => ({
        id: g.id,
        name: g.name,
      })),
    [groupsQuery.data],
  )

  // ── Empty state guard ──────────────────────────────────────────
  if (isEntirelyEmpty) {
    return (
      <PageShell title='Home'>
        <LensSelector
          activeLens={activeLens}
          lenses={lenses}
          onLensChange={setActiveLens}
        />
        <div className='p-4 md:p-6 lg:p-8'>
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
      {/* Lens + Group filter */}
      <LensSelector
        activeLens={activeLens}
        lenses={lenses}
        onLensChange={setActiveLens}
      />
      <GroupFilterBar
        activeGroupIds={activeGroupIds}
        availableGroups={availableGroupItems}
        onClearAll={() => setActiveGroupIds([])}
        onOpenSelector={() => {
          // Group selection popover TBD — for now, toggle is managed via chips
        }}
        onToggleGroup={(groupId: string) => {
          setActiveGroupIds((prev) =>
            prev.includes(groupId)
              ? prev.filter((id) => id !== groupId)
              : [...prev, groupId],
          )
        }}
      />

      <div className='space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8'>
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

        {/* Budget status (simplified: show budget cards with limits only for now) */}
        {budgetListQuery.data && budgetListQuery.data.items.length > 0 ? (
          <BudgetCardsPlaceholder
            budgets={budgetListQuery.data.items}
            currencyCode={budgetListQuery.data.items[0]?.currencyCode ?? 'VND'}
          />
        ) : null}

        {/* 2-column grid: Recent Expenses + Category Breakdown */}
        <div className='grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
          <RecentExpenses
            error={recentExpensesQuery.error}
            expenses={recentItems}
            isEmpty={recentItems.length === 0 && !recentExpensesQuery.isLoading}
            isLoading={recentExpensesQuery.isLoading}
            onRetry={() => recentExpensesQuery.refetch()}
          />

          {/* Category breakdown from analytics */}
          {overviewData?.topCategories ? (
            <CategoryBreakdownPlaceholder
              categories={overviewData.topCategories}
              currencyCode={overviewData.currencyCode}
            />
          ) : overviewQuery.isLoading ? (
            <div className='rounded-xl border bg-card p-4'>
              <p className='text-sm text-muted-foreground'>
                Loading categories...
              </p>
            </div>
          ) : null}
        </div>

        {/* Household section (only when household lens active) */}
        <HouseholdCardsSection
          household={activeHousehold}
          isLoading={overviewQuery.isLoading && activeLens.type === 'household'}
        />
      </div>
    </PageShell>
  )
}

// ── Inline placeholders (to avoid too many component files) ──────

import { CategoryBreakdown } from '@/components/home/category-breakdown'
import { Progress } from '@/components/ui/progress'
import type { AnalyticsTopCategoryDTO } from '@/types/analytics'
import type { BudgetDTO } from '@/types/budget'

function CategoryBreakdownPlaceholder({
  categories,
  currencyCode,
}: {
  categories: AnalyticsTopCategoryDTO[]
  currencyCode: string
}) {
  if (categories.length === 0) {
    return (
      <CategoryBreakdown
        isEmpty
        categories={[]}
        currencyCode={currencyCode}
        isLoading={false}
        totalSpendMinor={0}
      />
    )
  }

  return (
    <CategoryBreakdown
      categories={categories}
      currencyCode={currencyCode}
      isEmpty={false}
      isLoading={false}
      totalSpendMinor={0}
    />
  )
}

function BudgetCardsPlaceholder({
  budgets,
  currencyCode: _currencyCode,
}: {
  budgets: BudgetDTO[]
  currencyCode: string
}) {
  // Simple display of budget cards with limits
  return (
    <div className='flex snap-x snap-mandatory gap-3 overflow-x-auto px-0 pb-2 md:flex-wrap md:overflow-x-visible'>
      {budgets.slice(0, 5).map((budget) => (
        <div
          key={budget.id}
          className='max-w-[220px] min-w-[180px] shrink-0 snap-start space-y-2 rounded-xl border bg-card p-4 md:shrink'>
          <span className='text-sm font-medium'>Budget</span>
          <Progress className='h-2' value={0} />
          <p className='text-xs text-muted-foreground'>
            Limit: {formatCurrency(budget.totalLimitMinor, budget.currencyCode)}
          </p>
          <p className='text-xs text-muted-foreground'>
            Connect budget tracking to see actual spend
          </p>
        </div>
      ))}
    </div>
  )
}

export { OverviewPage }
