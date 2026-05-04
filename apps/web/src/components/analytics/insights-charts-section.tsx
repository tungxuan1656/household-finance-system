'use client'

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
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { AnalyticsOverviewDTO } from '@/types/analytics'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

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
  return (
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
              data={data.dailySpend}
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
                      categoryMap.get(category.categoryKey)?.color ?? '#94a3b8'
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
          <div className='flex flex-col gap-3'>
            {data.topCategories.map((category) => {
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
                        data.currencyCode,
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
  )
}

export { InsightsChartsSection }
