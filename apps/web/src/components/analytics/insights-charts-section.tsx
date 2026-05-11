'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
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
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { AnalyticsOverviewDTO } from '@/types/analytics'
import type { CategoryKey, ReferenceCategoryDTO } from '@/types/reference-data'

type InsightsChartsSectionProps = {
  data: AnalyticsOverviewDTO
  categoryMap: Map<string, ReferenceCategoryDTO>
  formatCurrency: (amount: number, currencyCode: string) => string
}

function InsightsChartsSection({
  data,
  categoryMap,
  formatCurrency,
}: InsightsChartsSectionProps) {
  const dailySpendSummary = data.dailySpend.length
    ? t('insights.dailySpend.description') +
      ': ' +
      data.dailySpend
        .map(
          (entry) =>
            `${entry.date} ${formatCurrency(entry.totalSpendMinor, data.currencyCode)}`,
        )
        .join(', ')
    : t('insights.empty.description')

  return (
    <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
      <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle>{t('insights.dailySpend.title')}</CardTitle>
          <CardDescription>
            {t('insights.dailySpend.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='sr-only'>{dailySpendSummary}</p>
          <div
            aria-label={t('insights.dailySpend.title')}
            className='h-[288px] w-full'
            role='img'>
            <ResponsiveContainer height='100%' width='100%'>
              <BarChart
                accessibilityLayer
                data={data.dailySpend}
                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  angle={-45}
                  axisLine={false}
                  dataKey='date'
                  height={60}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  formatter={(value) => {
                    const amount =
                      typeof value === 'number' ? value : Number(value) || 0

                    return [
                      formatCurrency(amount, data.currencyCode),
                      t('insights.summary.totalSpend'),
                    ]
                  }}
                />
                <Bar
                  dataKey='totalSpendMinor'
                  fill='var(--color-chart-1, #0f766e)'
                  name={t('insights.summary.totalSpend')}
                  radius={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle>{t('insights.topCategories.title')}</CardTitle>
          <CardDescription>
            {t('insights.topCategories.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='sr-only'>
            {data.topCategories.length
              ? t('insights.topCategories.description') +
                ': ' +
                data.topCategories
                  .map(
                    (category) =>
                      `${getCategoryLabel(category.categoryKey)} ${formatCurrency(category.totalSpendMinor, data.currencyCode)} ${category.percentOfTotal}%`,
                  )
                  .join(', ')
              : t('insights.empty.description')}
          </p>
          <div
            aria-label={t('insights.topCategories.title')}
            className='h-[224px] w-full'
            role='img'>
            <ResponsiveContainer height='100%' width='100%'>
              <PieChart>
                <Pie
                  data={data.topCategories}
                  dataKey='totalSpendMinor'
                  innerRadius={50}
                  nameKey='categoryKey'
                  outerRadius={80}
                  paddingAngle={3}>
                  {data.topCategories.map((category) => (
                    <Cell
                      key={category.categoryKey}
                      fill={
                        categoryMap.get(category.categoryKey)?.color ??
                        '#94a3b8'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const amount =
                      typeof value === 'number' ? value : Number(value) || 0
                    const label =
                      typeof name === 'string'
                        ? getCategoryLabel(name as CategoryKey)
                        : ''

                    return [formatCurrency(amount, data.currencyCode), label]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className='flex flex-col gap-3'>
            {data.topCategories.map((category) => {
              const categoryMeta = categoryMap.get(category.categoryKey)

              return (
                <div
                  key={category.categoryKey}
                  className='flex items-center justify-between gap-4'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <span
                      aria-hidden='true'
                      className='size-3 shrink-0 rounded-full'
                      style={{
                        backgroundColor: categoryMeta?.color ?? '#999',
                      }}
                    />
                    <span className='truncate'>
                      {getCategoryLabel(category.categoryKey)}
                    </span>
                  </div>
                  <div className='min-w-0 text-right text-sm text-muted-foreground'>
                    <div className='break-words'>
                      {formatCurrency(
                        category.totalSpendMinor,
                        data.currencyCode,
                      )}
                    </div>
                    <div className='break-words'>
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
  )
}

export { InsightsChartsSection }
