'use client'

import { useEffect, useMemo, useState } from 'react'

import { EmptyState } from '@/components/home/empty-state'
import { GroupFilterBar } from '@/components/home/group-filter-bar'
import { type GroupInfo } from '@/components/home/group-filter-bar'
import { HeroStatsCard } from '@/components/home/hero-stats-card'
import { RecentExpenses } from '@/components/home/recent-expenses'
import { type RecentExpenseItem } from '@/components/home/recent-expenses'
import { CardPlaceholder } from '@/components/shared/card-placeholder'
import { PageShell } from '@/components/ui/page-shell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAnalyticsComparisonQuery } from '@/hooks/api/use-analytics'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useExpenseSummaryQuery } from '@/hooks/api/use-expense'
import { useInfiniteExpenseListQuery } from '@/hooks/api/use-expense'
import { useExpenseGroupListQuery } from '@/hooks/api/use-groups'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { householdActions } from '@/stores/household.store'
import { useHouseholdStore } from '@/stores/household.store'
import { getCurrentPeriod } from '@/views/app/overview/overview-formatters'

import { CategoryBreakdownPlaceholder } from './overview/category-breakdown-placeholder'

type Lens =
  | { type: 'personal' }
  | { type: 'household'; householdId: string; householdName: string }

const RECENT_LIMIT = 5

function getDaysRemaining(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return lastDay.getDate() - now.getDate() + 1
}

function OverviewPage() {
  const households = useHouseholdStore.use.households()
  const householdsLoading = useHouseholdStore.use.isLoading()
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
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
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
        <Tabs
          className='px-4 pt-4 md:px-6 lg:px-8'
          value={
            activeLens.type === 'personal' ? 'personal' : activeLens.householdId
          }
          onValueChange={(value) => {
            if (value === 'personal') {
              setActiveLens({ type: 'personal' })

              return
            }

            const lens = lenses.find(
              (item): item is Extract<Lens, { type: 'household' }> =>
                item.type === 'household' && item.householdId === value,
            )
            if (lens) setActiveLens(lens)
          }}>
          <TabsList className='w-full justify-start overflow-x-auto'>
            {lenses.map((lens) => (
              <TabsTrigger
                key={lens.type === 'personal' ? 'personal' : lens.householdId}
                value={
                  lens.type === 'personal' ? 'personal' : lens.householdId
                }>
                {lens.type === 'personal'
                  ? t('app.overview.lenses.personal')
                  : lens.householdName}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent className='mt-0' value='personal' />
          {lenses
            .filter(
              (lens): lens is Extract<Lens, { type: 'household' }> =>
                lens.type === 'household',
            )
            .map((lens) => (
              <TabsContent
                key={lens.householdId}
                className='mt-0'
                value={lens.householdId}
              />
            ))}
        </Tabs>
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
      <Tabs
        value={
          activeLens.type === 'personal' ? 'personal' : activeLens.householdId
        }
        onValueChange={(value) => {
          if (value === 'personal') {
            setActiveLens({ type: 'personal' })

            return
          }

          const lens = lenses.find(
            (item): item is Extract<Lens, { type: 'household' }> =>
              item.type === 'household' && item.householdId === value,
          )
          if (lens) setActiveLens(lens)
        }}>
        <TabsList className='justify-start overflow-x-auto'>
          {lenses.map((lens) => (
            <TabsTrigger
              key={lens.type === 'personal' ? 'personal' : lens.householdId}
              value={lens.type === 'personal' ? 'personal' : lens.householdId}>
              {lens.type === 'personal'
                ? t('app.overview.lenses.personal')
                : lens.householdName}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent className='mt-0' value='personal' />
        {lenses
          .filter(
            (lens): lens is Extract<Lens, { type: 'household' }> =>
              lens.type === 'household',
          )
          .map((lens) => (
            <TabsContent
              key={lens.householdId}
              className='mt-0'
              value={lens.householdId}
            />
          ))}
      </Tabs>
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

        <RecentExpenses
          error={recentExpensesQuery.error}
          expenses={recentItems}
          isEmpty={recentItems.length === 0 && !recentExpensesQuery.isLoading}
          isLoading={recentExpensesQuery.isLoading}
          referenceCategories={referenceCategoriesQuery.data?.items}
          onRetry={() => recentExpensesQuery.refetch()}
        />

        {/* Category breakdown from analytics */}
        <CardPlaceholder isEmpty={true} isLoading={overviewQuery.isLoading}>
          <CategoryBreakdownPlaceholder
            categories={overviewData?.topCategories ?? []}
            currencyCode={overviewData?.currencyCode ?? 'VND'}
            referenceCategories={referenceCategoriesQuery.data?.items}
          />
        </CardPlaceholder>
      </div>
    </PageShell>
  )
}

export { OverviewPage }
