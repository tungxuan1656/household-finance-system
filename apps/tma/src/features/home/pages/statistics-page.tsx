import { useTranslation } from 'react-i18next'

import { QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAnalyticsOverviewQuery } from '@/features/home/api'
import { PeriodChipLink } from '@/features/period/components/period-chip-link'
import { usePeriodStore } from '@/features/period/store'
import { toAnalyticsRangeParams } from '@/lib/period/format'

import { CategoryBreakdownCard } from '../components/category-breakdown-card'
import { StatisticsMetaCard } from '../components/statistics-meta-card'
import { StatisticsPeriodToggle } from '../components/statistics-period-toggle'
import { StatisticsTotalCard } from '../components/statistics-total-card'

export const StatisticsPage = () => {
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const setSelectedPeriod = usePeriodStore((state) => state.setSelectedPeriod)
  const overviewParams = toAnalyticsRangeParams(selectedPeriod)
  const overviewQuery = useAnalyticsOverviewQuery(overviewParams)

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      title={t('statistics.title')}>
      <QueryState
        empty={{
          title: t('statistics.emptyTitle'),
          description: t('statistics.emptyDesc'),
          action: <PeriodChipLink tone='muted' />,
        }}
        error={{
          title: t('statistics.loadError'),
          description: t('statistics.loadErrorDesc'),
        }}
        isEmpty={(data) => data.expenseCount === 0}
        pending={{
          title: t('statistics.loadingTitle'),
          description: t('statistics.loadingDesc'),
        }}
        query={overviewQuery}>
        {(overview) => (
          <>
            <StatisticsTotalCard
              overview={overview}
              selectedPeriod={selectedPeriod}
            />
            <StatisticsPeriodToggle
              selectedPeriod={selectedPeriod}
              onChange={setSelectedPeriod}
            />
            <CategoryBreakdownCard overview={overview} />
            <StatisticsMetaCard
              overview={overview}
              selectedPeriod={selectedPeriod}
            />
          </>
        )}
      </QueryState>
    </TmaPageShell>
  )
}
