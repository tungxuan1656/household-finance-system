'use client'

import { useId } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { DataState } from '@/components/shared/data-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import type { AnalyticsTopCategoryDTO } from '@/types/analytics'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { formatCurrency } from '@/utils/currency/format'

type CategoryItem = AnalyticsTopCategoryDTO

type CategoryBreakdownProps = {
  categories: CategoryItem[]
  currencyCode: string
  isLoading: boolean
  isEmpty: boolean
  isError?: boolean
  referenceCategories?: ReferenceCategoryDTO[]
}

const CATEGORY_CHART_COLORS = [
  'var(--color-chart-1, #0f766e)',
  'var(--color-chart-2, #ea580c)',
  'var(--color-chart-3, #7c3aed)',
  'var(--color-chart-4, #ca8a04)',
  'var(--color-chart-5, #0284c7)',
]

function CategoryBreakdown({
  categories,
  currencyCode,
  isLoading,
  isEmpty,
  isError,
  referenceCategories,
}: CategoryBreakdownProps) {
  const summaryId = useId()
  const chartCategories = categories.map((category, index) => {
    const presentation = getCategoryPresentation(
      category.categoryKey,
      referenceCategories,
    )

    return {
      ...category,
      color:
        presentation.color ??
        CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length],
      label: presentation.label,
    }
  })
  const totalSpendMinor = chartCategories.reduce(
    (total, category) => total + category.totalSpendMinor,
    0,
  )
  const categorySummary = chartCategories
    .map(
      (category) =>
        `${category.label} ${formatCurrency(category.totalSpendMinor, currencyCode)} ${category.percentOfTotal}%`,
    )
    .join(', ')

  return (
    <DataState
      emptyDescription={t('app.overview.categoryBreakdown.empty')}
      isEmpty={isEmpty}
      isError={isError}
      isLoading={isLoading}
      title={t('app.overview.categoryBreakdown.title')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('app.overview.categoryBreakdown.title')}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-5'>
          <p className='sr-only' id={summaryId}>
            {categorySummary}
          </p>
          <div
            aria-describedby={summaryId}
            aria-label={t('app.overview.categoryBreakdown.title')}
            className='relative h-64 w-full'
            role='img'>
            <ResponsiveContainer height='100%' width='100%'>
              <PieChart>
                <Pie
                  data={chartCategories}
                  dataKey='totalSpendMinor'
                  innerRadius={62}
                  nameKey='label'
                  outerRadius={92}
                  paddingAngle={2}>
                  {chartCategories.map((category) => (
                    <Cell key={category.categoryKey} fill={category.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const amount =
                      typeof value === 'number' ? value : Number(value) || 0

                    return [
                      formatCurrency(amount, currencyCode),
                      typeof name === 'string' ? name : '',
                    ]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center'>
              <span className='font-mono text-lg font-semibold tabular-nums'>
                {formatCurrency(totalSpendMinor, currencyCode)}
              </span>
              <span className='text-xs text-muted-foreground'>
                {t('app.overview.categoryBreakdown.title')}
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            {chartCategories.map((category) => (
              <div
                key={category.categoryKey}
                className='flex items-center justify-between gap-4'>
                <div className='flex min-w-0 items-center gap-3'>
                  <span
                    aria-hidden='true'
                    className='size-3 shrink-0 rounded-full'
                    style={{ backgroundColor: category.color }}
                  />
                  <div className='min-w-0'>
                    <div className='truncate text-sm font-medium'>
                      {category.label}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {t('app.overview.summary.expenseCount')}:{' '}
                      {category.expenseCount}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-mono text-sm tabular-nums'>
                    {formatCurrency(category.totalSpendMinor, currencyCode)}
                  </div>
                  <div className='font-mono text-xs text-muted-foreground tabular-nums'>
                    {category.percentOfTotal}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DataState>
  )
}

export type { CategoryBreakdownProps, CategoryItem }
export { CategoryBreakdown }
