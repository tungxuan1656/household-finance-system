'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import type { AnalyticsOverviewDTO } from '@/types/analytics'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { formatCurrency } from '@/utils/currency/format'

type InsightsSummaryCardsProps = {
  data: AnalyticsOverviewDTO
  categoryMap: Map<string, ReferenceCategoryDTO>
}

function InsightsSummaryCards({
  data,
  categoryMap,
}: InsightsSummaryCardsProps) {
  const chartData = data.topCategories.slice(0, 5)

  return (
    <Card className='overflow-hidden'>
      <CardContent className='flex flex-row items-center gap-6 p-6'>
        {/* Left: Total amount */}
        <div className='flex flex-1 flex-col gap-2'>
          <CardDescription className='text-xs font-medium tracking-wider uppercase'>
            {data.period}
          </CardDescription>
          <div className='font-heading text-4xl font-bold tracking-tight text-foreground'>
            {formatCurrency(data.totalSpendMinor, data.currencyCode)}
          </div>
          <div className='flex flex-wrap gap-2 pt-2'>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium'>
              {data.expenseCount} {t('expense.feed.expenses')}
            </span>
          </div>
        </div>

        {/* Right: Donut chart */}
        {chartData.length > 0 ? (
          <div
            aria-label={t('insights.topCategories.title')}
            className='relative h-36 w-36 shrink-0'
            role='img'>
            <ResponsiveContainer height='100%' width='100%'>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey='totalSpendMinor'
                  innerRadius={38}
                  nameKey='categoryKey'
                  outerRadius={64}
                  paddingAngle={2}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.categoryKey}
                      fill={
                        categoryMap.get(entry.categoryKey)?.color ?? '#94a3b8'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const amount =
                      typeof value === 'number' ? value : Number(value) || 0

                    return [formatCurrency(amount, data.currencyCode), '']
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { InsightsSummaryCards }
