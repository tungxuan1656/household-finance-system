import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsComparisonQuery } from '@/features/home/api'
import {
  formatCurrencyMinor,
  getComparisonLabel,
} from '@/features/home/presentation'
import type { AnalyticsOverviewDTO } from '@/features/home/types'
import {
  formatPeriodSelectionRangeLabel,
  toAnalyticsRangeParams,
} from '@/lib/period/format'
import type { PeriodSelection } from '@/lib/period/types'

interface StatisticsTotalCardProps {
  overview: AnalyticsOverviewDTO
  selectedPeriod: PeriodSelection
}

export const StatisticsTotalCard = ({
  overview,
  selectedPeriod,
}: StatisticsTotalCardProps) => {
  const { t } = useTranslation()
  const overviewParams = toAnalyticsRangeParams(selectedPeriod)
  const comparisonQuery = useAnalyticsComparisonQuery(overviewParams)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('statistics.eyebrowTotalSpent')}</CardTitle>
        <CardDescription>
          {formatPeriodSelectionRangeLabel(selectedPeriod)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <span className='mt-1 block font-mono text-[30px] leading-none font-extrabold text-foreground [font-variant-numeric:tabular-nums]'>
          {formatCurrencyMinor(overview.totalSpendMinor, overview.currencyCode)}
        </span>
        <CardDescription className='mt-2'>
          {comparisonQuery.status === 'pending' ? (
            <Skeleton className='h-4 w-3/5' />
          ) : (
            getComparisonLabel(
              comparisonQuery.data,
              overview.expenseCount,
              selectedPeriod.granularity,
              t,
            )
          )}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
