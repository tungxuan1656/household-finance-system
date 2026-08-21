import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalyticsOverviewDTO } from '@/features/home/types'
import { formatPeriodSelectionRangeLabel } from '@/lib/period/format'
import type { PeriodSelection } from '@/lib/period/types'

interface StatisticsMetaCardProps {
  overview: AnalyticsOverviewDTO
  selectedPeriod: PeriodSelection
}

export const StatisticsMetaCard = ({
  overview,
  selectedPeriod,
}: StatisticsMetaCardProps) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('statistics.statExpenseCount')}</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-2.5'>
        <div className='px-3.5 py-3'>
          <span className='block text-xs font-semibold text-muted-foreground'>
            {t('statistics.statExpenseCount')}
          </span>
          <strong className='mt-1 block font-mono text-base font-extrabold text-foreground [font-variant-numeric:tabular-nums]'>
            {overview.expenseCount}
          </strong>
        </div>
        <div className='px-3.5 py-3'>
          <span className='block text-xs font-semibold text-muted-foreground'>
            {t('statistics.dateRange')}
          </span>
          <strong className='mt-1 block font-mono text-sm font-extrabold text-foreground [font-variant-numeric:tabular-nums]'>
            {formatPeriodSelectionRangeLabel(selectedPeriod)}
          </strong>
        </div>
      </CardContent>
    </Card>
  )
}
