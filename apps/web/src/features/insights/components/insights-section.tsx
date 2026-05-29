'use client'

import { useMemo } from 'react'

import { InsightsChartsSection } from '@/features/insights/components/insights-charts-section'
import { InsightsComparisonPanel } from '@/features/insights/components/insights-comparison-panel'
import { InsightsGroupsPanel } from '@/features/insights/components/insights-groups-panel'
import { InsightsOverviewPanel } from '@/features/insights/components/insights-overview-panel'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import type { AnalyticsOverviewParams } from '@/types/analytics'

import {
  useAnalyticsComparisonQuery,
  useAnalyticsGroupsQuery,
  useAnalyticsOverviewQuery,
} from '../api/use-analytics'

type InsightsSectionProps = {
  householdId: string | null
  period: string
}

export function InsightsSection({ householdId, period }: InsightsSectionProps) {
  const analyticsParams: AnalyticsOverviewParams = useMemo(
    () => ({
      period,
      ...(householdId ? { household_id: householdId } : {}),
    }),
    [period, householdId],
  )

  const {
    data,
    isLoading,
    error,
    refetch: refetchOverview,
  } = useAnalyticsOverviewQuery(analyticsParams)
  const {
    data: comparisonData,
    isLoading: isComparisonLoading,
    error: comparisonError,
    refetch: refetchComparison,
  } = useAnalyticsComparisonQuery(analyticsParams)
  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useAnalyticsGroupsQuery(analyticsParams)
  const { data: categoriesData } = useReferenceCategoriesQuery()

  const categoryMap = useMemo(
    () =>
      new Map(
        (categoriesData?.items ?? []).map((category) => [
          category.key,
          category,
        ]),
      ),
    [categoriesData?.items],
  )

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      <InsightsOverviewPanel
        categoryMap={categoryMap}
        data={data}
        error={error}
        isLoading={isLoading}
        onRetry={() => void refetchOverview()}
      />

      {!isLoading && !error && data && data.expenseCount > 0 ? (
        <>
          <InsightsChartsSection categoryMap={categoryMap} data={data} />

          <InsightsComparisonPanel
            data={comparisonData}
            error={comparisonError}
            isLoading={isComparisonLoading}
            onRetry={() => void refetchComparison()}
          />

          <InsightsGroupsPanel
            data={groupsData}
            error={groupsError}
            isLoading={isGroupsLoading}
            onRetry={() => void refetchGroups()}
          />
        </>
      ) : null}
    </div>
  )
}
