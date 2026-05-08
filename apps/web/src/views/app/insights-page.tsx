'use client'

import { useEffect, useMemo, useState } from 'react'

import { InsightsChartsSection } from '@/components/analytics'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsGroupsQuery,
  useAnalyticsOverviewQuery,
} from '@/hooks/api/use-analytics'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import { InsightsComparisonPanel } from '@/views/app/insights/insights-comparison-panel'
import { InsightsGroupsPanel } from '@/views/app/insights/insights-groups-panel'
import { InsightsHeader } from '@/views/app/insights/insights-header'
import { InsightsOverviewPanel } from '@/views/app/insights/insights-overview-panel'
import {
  buildPeriodOptions,
  formatCurrency,
  getDefaultPeriod,
} from '@/views/app/insights/insights-period'

type InsightsPageProps = {
  initialPeriod?: string
}

function InsightsPage({ initialPeriod }: InsightsPageProps) {
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const [period, setPeriod] = useState(initialPeriod ?? getDefaultPeriod())
  const [hasRequestedHouseholds, setHasRequestedHouseholds] = useState(false)
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id
  const shouldLoadHouseholds = households.length === 0 && !currentHousehold
  const shouldFetchAnalytics =
    Boolean(selectedHouseholdId) || hasRequestedHouseholds

  useEffect(() => {
    if (shouldLoadHouseholds) {
      setHasRequestedHouseholds(true)
      void householdActions.fetchHouseholds()
    }
  }, [shouldLoadHouseholds])

  const analyticsParams = useMemo(
    () => ({
      period,
      ...(selectedHouseholdId ? { household_id: selectedHouseholdId } : {}),
    }),
    [period, selectedHouseholdId],
  )

  const {
    data,
    isLoading,
    error,
    refetch: refetchOverview,
  } = useAnalyticsOverviewQuery(analyticsParams, {
    enabled: shouldFetchAnalytics,
  })
  const {
    data: comparisonData,
    isLoading: isComparisonLoading,
    error: comparisonError,
    refetch: refetchComparison,
  } = useAnalyticsComparisonQuery(analyticsParams, {
    enabled: shouldFetchAnalytics,
  })
  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useAnalyticsGroupsQuery(analyticsParams, {
    enabled: shouldFetchAnalytics,
  })
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
  const periodOptions = useMemo(() => buildPeriodOptions(period), [period])

  const isExportDisabled =
    isLoading ||
    isComparisonLoading ||
    isGroupsLoading ||
    Boolean(error) ||
    Boolean(comparisonError) ||
    Boolean(groupsError) ||
    !data ||
    data.expenseCount === 0

  return (
    <div className='flex flex-col gap-6'>
      <InsightsHeader
        isExportDisabled={isExportDisabled}
        params={analyticsParams}
        period={period}
        periodOptions={periodOptions}
        onPeriodChange={setPeriod}
      />

      <InsightsOverviewPanel
        data={data}
        error={error}
        formatCurrency={formatCurrency}
        isLoading={isLoading}
        onRetry={() => void refetchOverview()}
      />

      {/* Render remaining sections only when overview data is available and has expenses */}
      {!isLoading && !error && data && data.expenseCount > 0 ? (
        <>
          <InsightsComparisonPanel
            data={comparisonData}
            error={comparisonError}
            formatCurrency={formatCurrency}
            isLoading={isComparisonLoading}
            onRetry={() => void refetchComparison()}
          />

          <InsightsChartsSection
            categoryMap={categoryMap}
            data={data}
            formatCurrency={formatCurrency}
          />

          <InsightsGroupsPanel
            data={groupsData}
            error={groupsError}
            formatCurrency={formatCurrency}
            isLoading={isGroupsLoading}
            onRetry={() => void refetchGroups()}
          />
        </>
      ) : null}
    </div>
  )
}

export { InsightsPage }
