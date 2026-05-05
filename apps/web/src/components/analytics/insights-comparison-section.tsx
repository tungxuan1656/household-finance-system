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

type InsightsComparisonSectionProps = {
  data: AnalyticsComparisonDTO
  formatCurrency: (amount: number, currencyCode: string) => string
}

function InsightsComparisonSection({
  data,
  formatCurrency,
}: InsightsComparisonSectionProps) {
  const deltaPositive = data.totalDeltaSpendMinor <= 0
  const TrendIcon = deltaPositive ? TrendingUpIcon : TrendingDownIcon

  return (
    <section className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'>
      <Card>
        <CardHeader>
          <CardTitle>{t('insights.comparison.title')}</CardTitle>
          <CardDescription>
            {t('insights.comparison.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-sm text-muted-foreground'>
                {data.currentPeriod.period}
              </span>
              <span className='font-heading text-2xl tracking-tight'>
                {formatCurrency(
                  data.currentPeriod.totalSpendMinor,
                  data.currencyCode,
                )}
              </span>
            </div>
            <Badge variant={deltaPositive ? 'secondary' : 'destructive'}>
              <TrendIcon data-icon='inline-start' />
              {formatCurrency(data.totalDeltaSpendMinor, data.currencyCode)}
            </Badge>
          </div>

          <div className='grid gap-3 md:grid-cols-2'>
            <div className='rounded-lg border p-3'>
              <div className='text-sm text-muted-foreground'>
                {t('insights.comparison.currentPeriod')}
              </div>
              <div className='font-heading text-xl'>
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
              <div className='font-heading text-xl'>
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
                <div className='flex flex-col gap-1'>
                  <span>
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
                  variant={
                    category.deltaSpendMinor <= 0 ? 'secondary' : 'destructive'
                  }>
                  {formatCurrency(category.deltaSpendMinor, data.currencyCode)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('insights.payers.title')}</CardTitle>
          <CardDescription>{t('insights.payers.description')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {data.payerAttribution.map((payer, index) => (
            <div
              key={`${payer.payerUserId}-${index}`}
              className='flex flex-col gap-1'>
              <div className='flex items-center justify-between gap-4'>
                <span>{payer.payerDisplayName ?? payer.payerUserId}</span>
                <span className='text-sm text-muted-foreground'>
                  {payer.percentOfTotal}%
                </span>
              </div>
              <div className='h-2 rounded-full bg-muted'>
                <div
                  className='h-2 rounded-full bg-primary'
                  style={{ width: `${payer.percentOfTotal}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

export { InsightsComparisonSection }
