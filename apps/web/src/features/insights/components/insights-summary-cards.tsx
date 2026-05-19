'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import type { AnalyticsOverviewDTO } from '@/types/analytics'
import { formatCurrency } from '@/utils/currency/format'

type InsightsSummaryCardsProps = { data: AnalyticsOverviewDTO }

function InsightsSummaryCards({ data }: InsightsSummaryCardsProps) {
  return (
    <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle>{t('insights.summary.totalSpend')}</CardTitle>
          <CardDescription>{data.period}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='min-w-0 font-heading text-3xl tracking-tight wrap-break-word'>
            {formatCurrency(data.totalSpendMinor, data.currencyCode)}
          </div>
        </CardContent>
      </Card>
      <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle>{t('insights.summary.expenseCount')}</CardTitle>
          <CardDescription>
            {t('insights.summary.entriesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='min-w-0 font-heading text-3xl tracking-tight wrap-break-word'>
            {data.expenseCount}
          </div>
        </CardContent>
      </Card>
      <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle>{t('insights.summary.averageSpend')}</CardTitle>
          <CardDescription>
            {t('insights.summary.averageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='min-w-0 font-heading text-3xl tracking-tight wrap-break-word'>
            {formatCurrency(
              data.expenseCount > 0
                ? Math.round(data.totalSpendMinor / data.expenseCount)
                : 0,
              data.currencyCode,
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export { InsightsSummaryCards }
