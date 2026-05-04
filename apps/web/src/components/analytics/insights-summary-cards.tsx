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

type InsightsSummaryCardsProps = {
  data: AnalyticsOverviewDTO
  formatCurrency: (amount: number, currencyCode: string) => string
}

function InsightsSummaryCards({
  data,
  formatCurrency,
}: InsightsSummaryCardsProps) {
  return (
    <section className='grid gap-4 xl:grid-cols-3'>
      <Card>
        <CardHeader>
          <CardTitle>{t('insights.summary.totalSpend')}</CardTitle>
          <CardDescription>{data.period}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='font-heading text-3xl tracking-tight'>
            {formatCurrency(data.totalSpendMinor, data.currencyCode)}
          </div>
          <div className='text-sm text-muted-foreground'>
            {data.totalSpendMinor}
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
            {data.expenseCount}
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
