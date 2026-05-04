'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  InsightsChartsSection,
  InsightsLoadingState,
  InsightsSummaryCards,
} from '@/components/analytics'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
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
    Boolean(selectedHouseholdId) ||
    (hasRequestedHouseholds && !shouldLoadHouseholds)

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

  const { data, isLoading, error } = useAnalyticsOverviewQuery(
    analyticsParams,
    {
      enabled: shouldFetchAnalytics,
    },
  )
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

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('insights.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('insights.description')}
          </p>
        </div>
        <label className='flex flex-col gap-1 text-sm text-muted-foreground'>
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
      </header>

      {isLoading ? <InsightsLoadingState /> : null}

      {!isLoading && error ? (
        <Empty className='min-h-80 border'>
          <EmptyHeader>
            <EmptyTitle>{t('insights.error.title')}</EmptyTitle>
            <EmptyDescription>
              {t('insights.error.description')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!isLoading && data && data.expenseCount === 0 ? (
        <Empty className='min-h-80 border'>
          <EmptyHeader>
            <EmptyTitle>{t('insights.empty.title')}</EmptyTitle>
            <EmptyDescription>
              {t('insights.empty.description')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!isLoading && data && data.expenseCount > 0 ? (
        <>
          <InsightsSummaryCards data={data} formatCurrency={formatCurrency} />
          <InsightsChartsSection
            categoryMap={categoryMap}
            data={data}
            formatCurrency={formatCurrency}
          />
        </>
      ) : null}
    </div>
  )
}

export { InsightsPage }
