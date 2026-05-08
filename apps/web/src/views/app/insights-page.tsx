'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  AnalyticsExportAction,
  InsightsChartsSection,
  InsightsComparisonSection,
  InsightsGroupsSection,
  InsightsSummaryCards,
} from '@/components/analytics'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsGroupsQuery,
  useAnalyticsOverviewQuery,
} from '@/hooks/api/use-analytics'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

type InsightsPageProps = {
  initialPeriod?: string
}

const getDefaultPeriod = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

const formatCurrency = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)

const buildPeriodOptions = (selectedPeriod: string) => {
  const [yearValue, monthValue] = selectedPeriod.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue) - 1
  const baseDate = new Date(Date.UTC(year, month, 1))

  return Array.from({ length: 6 }, (_, index) => {
    const optionDate = new Date(baseDate)
    optionDate.setUTCMonth(baseDate.getUTCMonth() - index)

    const optionYear = optionDate.getUTCFullYear()
    const optionMonth = String(optionDate.getUTCMonth() + 1).padStart(2, '0')
    const value = `${optionYear}-${optionMonth}`

    return { value, label: value }
  })
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
      <header className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('insights.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('insights.description')}
          </p>
        </div>
        <div className='flex flex-wrap items-end gap-4'>
          <label className='flex flex-1 flex-col gap-1 text-sm text-muted-foreground'>
            <span>{t('insights.periodLabel')}</span>
            <NativeSelect
              aria-label={t('insights.periodLabel')}
              value={period}
              onChange={(event) => setPeriod(event.target.value)}>
              {periodOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <AnalyticsExportAction
            disabled={isExportDisabled}
            params={analyticsParams}
          />
        </div>
      </header>

      {/* Summary Cards */}
      {isLoading ? (
        <div
          className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'
          data-testid='insights-summary-skeleton'>
          <Skeleton className='h-32 rounded-xl' />
          <Skeleton className='h-32 rounded-xl' />
          <Skeleton className='h-32 rounded-xl' />
        </div>
      ) : error ? (
        <Empty className='min-h-32 border'>
          <EmptyHeader>
            <EmptyTitle>{t('insights.error.title')}</EmptyTitle>
            <EmptyDescription>
              {t('insights.error.description')}
            </EmptyDescription>
          </EmptyHeader>
          <Button variant='outline' onClick={() => void refetchOverview()}>
            {t('insights.actions.retry')}
          </Button>
        </Empty>
      ) : !data ? (
        <div
          className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'
          data-testid='insights-summary-skeleton'>
          <Skeleton className='h-32 rounded-xl' />
          <Skeleton className='h-32 rounded-xl' />
          <Skeleton className='h-32 rounded-xl' />
        </div>
      ) : data.expenseCount === 0 ? (
        <Empty className='min-h-80 border'>
          <EmptyHeader>
            <EmptyTitle>{t('insights.empty.title')}</EmptyTitle>
            <EmptyDescription>
              {t('insights.empty.description')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <InsightsSummaryCards data={data} formatCurrency={formatCurrency} />
      )}

      {/* Render remaining sections only when overview data is available and has expenses */}
      {!isLoading && !error && data && data.expenseCount > 0 ? (
        <>
          {/* Comparison */}
          {isComparisonLoading ? (
            <div
              className='grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'
              data-testid='insights-comparison-skeleton'>
              <Skeleton className='h-64 rounded-xl' />
              <Skeleton className='h-64 rounded-xl' />
            </div>
          ) : comparisonError ? (
            <Empty className='min-h-64 border'>
              <EmptyHeader>
                <EmptyTitle>{t('insights.error.title')}</EmptyTitle>
                <EmptyDescription>
                  {t('insights.error.description')}
                </EmptyDescription>
              </EmptyHeader>
              <Button
                variant='outline'
                onClick={() => void refetchComparison()}>
                {t('insights.actions.retry')}
              </Button>
            </Empty>
          ) : !comparisonData ? (
            <div
              className='grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'
              data-testid='insights-comparison-skeleton'>
              <Skeleton className='h-64 rounded-xl' />
              <Skeleton className='h-64 rounded-xl' />
            </div>
          ) : (
            <InsightsComparisonSection
              data={comparisonData}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Charts */}
          <InsightsChartsSection
            categoryMap={categoryMap}
            data={data}
            formatCurrency={formatCurrency}
          />

          {/* Groups */}
          {isGroupsLoading ? (
            <Skeleton
              className='h-64 rounded-xl'
              data-testid='insights-groups-skeleton'
            />
          ) : groupsError ? (
            <Empty className='min-h-64 border'>
              <EmptyHeader>
                <EmptyTitle>{t('insights.error.title')}</EmptyTitle>
                <EmptyDescription>
                  {t('insights.error.description')}
                </EmptyDescription>
              </EmptyHeader>
              <Button variant='outline' onClick={() => void refetchGroups()}>
                {t('insights.actions.retry')}
              </Button>
            </Empty>
          ) : !groupsData ? (
            <Skeleton
              className='h-64 rounded-xl'
              data-testid='insights-groups-skeleton'
            />
          ) : (
            <InsightsGroupsSection
              data={groupsData}
              formatCurrency={formatCurrency}
            />
          )}
        </>
      ) : null}
    </div>
  )
}

export { InsightsPage }
