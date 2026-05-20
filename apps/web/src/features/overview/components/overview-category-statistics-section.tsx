'use client'

import { useAnalyticsOverviewQuery } from '@/features/insights/api/use-analytics'
import { CategoryBreakdown } from '@/features/overview/components/category-breakdown'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'

type OverviewCategoryStatisticsSectionProps = {
  householdId?: string
  period: string
}

function OverviewCategoryStatisticsSection({
  householdId,
  period,
}: OverviewCategoryStatisticsSectionProps) {
  const overviewQuery = useAnalyticsOverviewQuery({
    period,
    household_id: householdId,
  })
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const overviewData = overviewQuery.data
  const categories = overviewData?.topCategories ?? []

  return (
    <CategoryBreakdown
      categories={categories}
      currencyCode={overviewData?.currencyCode ?? 'VND'}
      isEmpty={categories.length === 0 && !overviewQuery.isLoading}
      isError={overviewQuery.isError && !overviewData}
      isLoading={overviewQuery.isLoading}
      referenceCategories={referenceCategoriesQuery.data?.items}
    />
  )
}

export { OverviewCategoryStatisticsSection }
export type { OverviewCategoryStatisticsSectionProps }
