'use client'

import { useMemo } from 'react'

import { RecentExpenses } from '@/components/home/recent-expenses'
import { useInfiniteExpenseListQuery } from '@/hooks/api/use-expense'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'

const RECENT_LIMIT = 5

type OverviewRecentExpensesSectionProps = {
  householdId?: string
}

function OverviewRecentExpensesSection({
  householdId,
}: OverviewRecentExpensesSectionProps) {
  const recentParams = useMemo(
    () => ({
      limit: RECENT_LIMIT,
      sort: 'occurred_at_desc' as const,
      household_id: householdId,
    }),
    [householdId],
  )

  const recentExpensesQuery = useInfiniteExpenseListQuery(recentParams)
  const referenceCategoriesQuery = useReferenceCategoriesQuery()

  const recentItems = recentExpensesQuery.data?.pages?.[0]?.items ?? []

  return (
    <RecentExpenses
      error={recentExpensesQuery.error}
      expenses={recentItems}
      isEmpty={recentItems.length === 0 && !recentExpensesQuery.isLoading}
      isLoading={recentExpensesQuery.isLoading}
      referenceCategories={referenceCategoriesQuery.data?.items}
      onRetry={() => recentExpensesQuery.refetch()}
    />
  )
}

export { OverviewRecentExpensesSection }
export type { OverviewRecentExpensesSectionProps }
