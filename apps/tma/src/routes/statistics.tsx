import { useTranslation } from 'react-i18next'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardTitle,
  DataState,
  Eyebrow,
  MoneyLabel,
  Section,
} from '@/components/ui'
import {
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
  getComparisonLabel,
} from '@/features/home/presentation'
import type { AnalyticsOverviewDTO } from '@/features/home/types'
import { PeriodChipLink } from '@/features/period/components/period-chip-link'
import { usePeriodStore } from '@/features/period/store'
import {
  formatPeriodSelectionRangeLabel,
  toAnalyticsRangeParams,
} from '@/lib/period'

const chartColors = ['#3f7cff', '#5dd36d', '#ffd84d', '#ff8a3d', '#c5d0e7']

const getPieBackground = (
  categories: AnalyticsOverviewDTO['topCategories'],
): string => {
  if (categories.length === 0) {
    return 'conic-gradient(rgba(17,24,39,0.08) 0deg 360deg)'
  }

  let cursor = 0
  const segments = categories.map((category, index) => {
    const start = cursor
    const degrees = Math.max(0, (category.percentOfTotal / 100) * 360)
    cursor += degrees

    return `${chartColors[index % chartColors.length]} ${start}deg ${cursor}deg`
  })

  if (cursor < 360) {
    segments.push(`rgba(17,24,39,0.06) ${cursor}deg 360deg`)
  }

  return `conic-gradient(${segments.join(', ')})`
}

const getLegendPercent = (
  category: AnalyticsOverviewDTO['topCategories'][number],
  totalSpendMinor: number,
): number => {
  if (totalSpendMinor <= 0) {
    return 0
  }

  return Math.round((category.totalSpendMinor / totalSpendMinor) * 100)
}

export const StatisticsPage = () => {
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const overviewParams = toAnalyticsRangeParams(selectedPeriod)
  const overviewQuery = useAnalyticsOverviewQuery(overviewParams)
  const comparisonQuery = useAnalyticsComparisonQuery(overviewParams)
  const categoriesQuery = useReferenceCategoriesQuery()
  const overview = overviewQuery.data
  const topCategories = overview?.topCategories.slice(0, 5) ?? []
  const isOverviewEmpty =
    !overviewQuery.isLoading &&
    !overviewQuery.isError &&
    Boolean(overview) &&
    overview?.expenseCount === 0

  return (
    <TmaPageShell title={t('statistics.title')}>
      <DataState
        customAction={isOverviewEmpty ? <PeriodChipLink tone='muted' /> : null}
        emptyDescription={t('statistics.emptyDesc')}
        emptyTitle={t('statistics.emptyTitle')}
        errorDescription={t('statistics.loadErrorDesc')}
        errorTitle={t('statistics.loadError')}
        isEmpty={isOverviewEmpty}
        isError={overviewQuery.isError && !overview}
        isLoading={overviewQuery.isLoading && !overview}
        loadingDescription={t('statistics.loadingDesc')}
        loadingTitle={t('statistics.loadingTitle')}
        retryAction={overviewQuery.refetch}>
        {overview ? (
          <>
            <Card className='mb-3 grid gap-4 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <Eyebrow>{t('statistics.eyebrowTotalSpent')}</Eyebrow>
                  <MoneyLabel className='mt-1 block text-[30px] leading-none font-extrabold'>
                    {formatCurrencyMinor(
                      overview.totalSpendMinor,
                      overview.currencyCode,
                    )}
                  </MoneyLabel>
                  <CardDescription className='mt-2'>
                    {getComparisonLabel(
                      comparisonQuery.data,
                      overview.expenseCount,
                      selectedPeriod.granularity,
                      t,
                    )}
                  </CardDescription>
                </div>
                <PeriodChipLink />
              </div>
            </Card>

            <Card className='grid gap-5 p-5'>
              <CardTitle>{t('statistics.eyebrowCategoryBreakdown')}</CardTitle>

              <div className='grid justify-items-center gap-4'>
                <div
                  aria-label={t('statistics.chartAria')}
                  className='relative grid size-44 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),0_18px_34px_rgba(17,24,39,0.08)]'
                  role='img'
                  style={{ background: getPieBackground(topCategories) }}>
                  <div className='grid size-24 place-items-center rounded-full bg-white/95 text-center shadow-tma-soft'>
                    <div>
                      <Eyebrow>{t('statistics.total')}</Eyebrow>
                      <MoneyLabel className='block text-sm font-extrabold'>
                        {formatCurrencyMinor(
                          overview.totalSpendMinor,
                          overview.currencyCode,
                        )}
                      </MoneyLabel>
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid gap-2'>
                {topCategories.length > 0 ? (
                  topCategories.map((category, index) => {
                    const presentation = getCategoryPresentation(
                      category.categoryKey,
                      t,
                      categoriesQuery.data?.items,
                    )
                    const percent = getLegendPercent(
                      category,
                      overview.totalSpendMinor,
                    )

                    return (
                      <article
                        key={category.categoryKey}
                        className='flex items-center justify-between gap-3 rounded-2xl bg-black/4 px-3.5 py-3'>
                        <div className='flex min-w-0 items-center gap-3'>
                          <span
                            className='size-3 shrink-0 rounded-full'
                            style={{
                              background:
                                chartColors[index % chartColors.length],
                            }}
                          />
                          <div className='min-w-0'>
                            <h3 className='m-0 truncate text-sm font-bold text-tma-text-strong'>
                              {presentation.label}
                            </h3>
                            <CardDescription>
                              {t('statistics.expenseCount', {
                                count: category.expenseCount,
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className='shrink-0 text-right'>
                          <MoneyLabel className='block text-sm font-bold'>
                            {formatCurrencyMinor(
                              category.totalSpendMinor,
                              overview.currencyCode,
                            )}
                          </MoneyLabel>
                          <span className='text-xs font-bold text-tma-primary'>
                            {percent}%
                          </span>
                        </div>
                      </article>
                    )
                  })
                ) : (
                  <CardDescription>
                    {t('statistics.categoryRankingEmpty')}
                  </CardDescription>
                )}
              </div>
            </Card>

            <Section>
              <Card className='grid gap-3'>
                <div className='grid grid-cols-2 gap-2.5'>
                  <div className='rounded-2xl border border-black/6 bg-white/80 px-3.5 py-3 shadow-tma-soft'>
                    <span className='block text-xs font-semibold text-tma-text-muted'>
                      {t('statistics.statExpenseCount')}
                    </span>
                    <strong className='mt-1 block font-mono text-base font-extrabold text-tma-text-strong [font-variant-numeric:tabular-nums]'>
                      {overview.expenseCount}
                    </strong>
                  </div>
                  <div className='rounded-2xl border border-black/6 bg-white/80 px-3.5 py-3 shadow-tma-soft'>
                    <span className='block text-xs font-semibold text-tma-text-muted'>
                      {t('statistics.dateRange')}
                    </span>
                    <strong className='mt-1 block font-mono text-sm font-extrabold text-tma-text-strong [font-variant-numeric:tabular-nums]'>
                      {formatPeriodSelectionRangeLabel(selectedPeriod)}
                    </strong>
                  </div>
                </div>
              </Card>
            </Section>
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
