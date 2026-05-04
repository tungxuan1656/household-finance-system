'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
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
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id

  useEffect(() => {
    if (households.length === 0) {
      void householdActions.fetchHouseholds()
    }
  }, [households.length])

  const analyticsParams = useMemo(
    () => ({
      period,
      ...(selectedHouseholdId ? { household_id: selectedHouseholdId } : {}),
    }),
    [period, selectedHouseholdId],
  )

  const { data, isLoading, error } = useAnalyticsOverviewQuery(analyticsParams)
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

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <div className='flex items-end justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-72' />
          </div>
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-32 rounded-xl' />
          <Skeleton className='h-32 rounded-xl' />
        </div>
        <Skeleton className='h-72 rounded-xl' />
      </div>
    )
  }

  if (error) {
    return (
      <Empty className='min-h-80 border'>
        <EmptyHeader>
          <EmptyTitle>{t('insights.error.title')}</EmptyTitle>
          <EmptyDescription>{t('insights.error.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!isLoading && data && data.expenseCount === 0) {
    return (
      <Empty className='min-h-80 border'>
        <EmptyHeader>
          <EmptyTitle>{t('insights.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('insights.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

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

      <section className='grid gap-4 xl:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.summary.totalSpend')}</CardTitle>
            <CardDescription>{data?.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='font-heading text-3xl tracking-tight'>
              {data
                ? formatCurrency(data.totalSpendMinor, data.currencyCode)
                : '—'}
            </div>
            <div className='text-sm text-muted-foreground'>
              {data?.totalSpendMinor ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.summary.expenseCount')}</CardTitle>
            <CardDescription>
              {t('insights.summary.entriesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='font-heading text-3xl tracking-tight'>
              {data?.expenseCount ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.summary.averageSpend')}</CardTitle>
            <CardDescription>
              {t('insights.summary.averageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='font-heading text-3xl tracking-tight'>
              {data
                ? formatCurrency(
                    data.expenseCount > 0
                      ? Math.round(data.totalSpendMinor / data.expenseCount)
                      : 0,
                    data.currencyCode,
                  )
                : '—'}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.dailySpend.title')}</CardTitle>
            <CardDescription>
              {t('insights.dailySpend.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <BarChart
                accessibilityLayer
                data={data?.dailySpend ?? []}
                height={288}
                width={720}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis axisLine={false} dataKey='date' tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={80} />
                <Tooltip />
                <Bar
                  dataKey='totalSpendMinor'
                  fill='var(--color-chart-1, #0f766e)'
                  radius={8}
                />
              </BarChart>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('insights.topCategories.title')}</CardTitle>
            <CardDescription>
              {t('insights.topCategories.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex justify-center'>
              <PieChart height={224} width={320}>
                <Pie
                  data={data?.topCategories ?? []}
                  dataKey='totalSpendMinor'
                  innerRadius={50}
                  nameKey='categoryKey'
                  outerRadius={80}
                  paddingAngle={3}>
                  {(data?.topCategories ?? []).map((category) => (
                    <Cell
                      key={category.categoryKey}
                      fill={
                        categoryMap.get(category.categoryKey)?.color ??
                        '#94a3b8'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className='flex flex-col gap-3'>
              {data?.topCategories.map((category) => {
                const categoryMeta = categoryMap.get(category.categoryKey)

                return (
                  <div
                    key={category.categoryKey}
                    className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <span
                        aria-hidden='true'
                        className='size-3 rounded-full'
                        style={{
                          backgroundColor: categoryMeta?.color ?? '#999',
                        }}
                      />
                      <span>{getCategoryLabel(category.categoryKey)}</span>
                    </div>
                    <div className='text-right text-sm text-muted-foreground'>
                      <div>
                        {formatCurrency(
                          category.totalSpendMinor,
                          data?.currencyCode ?? 'VND',
                        )}
                      </div>
                      <div>
                        {category.percentOfTotal}% · {category.expenseCount}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export { InsightsPage }
