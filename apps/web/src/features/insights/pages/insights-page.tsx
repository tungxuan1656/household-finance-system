'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsGroupsQuery,
  useAnalyticsOverviewQuery,
} from '@/features/insights/api/use-analytics'
import { InsightsChartsSection } from '@/features/insights/components/insights-charts-section'
import { InsightsComparisonPanel } from '@/features/insights/components/insights-comparison-panel'
import { InsightsGroupsPanel } from '@/features/insights/components/insights-groups-panel'
import { InsightsHeader } from '@/features/insights/components/insights-header'
import { InsightsOverviewPanel } from '@/features/insights/components/insights-overview-panel'
import {
  buildPeriodOptions,
  getDefaultPeriod,
} from '@/features/insights/utils/insights-period'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

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
    <PageContainer>
      <PageHeader
        description={t('insights.description')}
        title={t('shell.protected.nav.insights')}
      />
      <PageContent>
        <div className='flex flex-col gap-4 md:gap-6'>
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
      </PageContent>
    </PageContainer>
  )
}

export { InsightsPage }
