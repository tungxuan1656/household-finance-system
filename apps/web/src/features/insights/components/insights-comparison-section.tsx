'use client'

import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import type { AnalyticsComparisonDTO } from '@/types/analytics'
import { formatCurrency } from '@/utils/currency/format'

type InsightsComparisonSectionProps = { data: AnalyticsComparisonDTO }

function InsightsComparisonSection({ data }: InsightsComparisonSectionProps) {
  const deltaPositive = data.totalDeltaSpendMinor <= 0
  const TrendIcon = deltaPositive ? TrendingUpIcon : TrendingDownIcon

  return (
    <section>
      <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle>{t('insights.comparison.title')}</CardTitle>
          <CardDescription>
            {t('insights.comparison.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 flex-col gap-1'>
              <span className='text-sm text-muted-foreground'>
                {data.currentPeriod.period}
              </span>
              <span className='min-w-0 font-heading text-2xl tracking-tight wrap-break-word'>
                {formatCurrency(
                  data.currentPeriod.totalSpendMinor,
                  data.currencyCode,
                )}
              </span>
            </div>
            <Badge
              className='max-w-full shrink-0 truncate'
              variant={deltaPositive ? 'secondary' : 'destructive'}>
              <TrendIcon className='shrink-0' data-icon='inline-start' />
              <span className='truncate'>
                {formatCurrency(data.totalDeltaSpendMinor, data.currencyCode)}
              </span>
            </Badge>
          </div>
          <div className='grid gap-3 md:grid-cols-2'>
            <div className='rounded-lg border p-3'>
              <div className='text-sm text-muted-foreground'>
                {t('insights.comparison.currentPeriod')}
              </div>
              <div className='min-w-0 font-heading text-xl wrap-break-word'>
                {formatCurrency(
                  data.currentPeriod.totalSpendMinor,
                  data.currencyCode,
                )}
              </div>
            </div>
            <div className='rounded-lg border p-3'>
              <div className='text-sm text-muted-foreground'>
                {t('insights.comparison.previousPeriod')}
              </div>
              <div className='min-w-0 font-heading text-xl wrap-break-word'>
                {formatCurrency(
                  data.previousPeriod.totalSpendMinor,
                  data.currencyCode,
                )}
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            {data.topCategoryDeltas.map((category) => (
              <div
                key={category.categoryKey}
                className='flex items-center justify-between gap-4 rounded-lg border p-3'>
                <div className='flex min-w-0 flex-col gap-1'>
                  <span className='truncate'>
                    {t(
                      `app.expenseReference.categories.${category.categoryKey}`,
                    )}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {formatCurrency(
                      category.currentTotalSpendMinor,
                      data.currencyCode,
                    )}
                  </span>
                </div>
                <Badge
                  className='max-w-full shrink-0 truncate'
                  variant={
                    category.deltaSpendMinor <= 0 ? 'secondary' : 'destructive'
                  }>
                  <span className='truncate'>
                    {formatCurrency(
                      category.deltaSpendMinor,
                      data.currencyCode,
                    )}
                  </span>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export { InsightsComparisonSection }
