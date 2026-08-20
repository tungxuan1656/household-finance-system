import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { QueryState } from '@/components/shared/query-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  budgetListQueryOptions,
  useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getBudgetProgress,
  getComparisonLabel,
  getHouseholdBudgetLabel,
} from '@/features/home/presentation'
import { PeriodChipLink } from '@/features/period/components/period-chip-link'
import { usePeriodStore } from '@/features/period/store'
import {
  getMonthBudgetPeriod,
  isMonthPeriodSelection,
  toAnalyticsRangeParams,
} from '@/lib/period'

export const FinanceSummaryCard = ({
  householdId,
  showBudgetPeriodContext = false,
  showPeriodChip = true,
  title: externalTitle,
}: {
  householdId?: string
  showBudgetPeriodContext?: boolean
  showPeriodChip?: boolean
  title?: string
}) => {
  const { t } = useTranslation()
  const title = externalTitle ?? t('summary.defaultTitle')
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const overviewParams = toAnalyticsRangeParams(selectedPeriod, householdId)
  const budgetPeriod = getMonthBudgetPeriod(selectedPeriod)
  const overviewQuery = useAnalyticsOverviewQuery(overviewParams)
  const comparisonQuery = useAnalyticsComparisonQuery(overviewParams)
  const budgetParams = householdId
    ? { householdId, period: budgetPeriod }
    : { scope: 'personal' as const, period: budgetPeriod }
  const budgetQuery = useQuery({
    ...budgetListQueryOptions(budgetParams),
  })

  const handleRetryAll = () =>
    void Promise.all([
      overviewQuery.refetch(),
      comparisonQuery.refetch(),
      budgetQuery.refetch(),
    ])

  return (
    <QueryState
      error={{
        title: t('summary.loadError'),
        description: t('summary.loadErrorDesc'),
      }}
      pending={{
        title: t('summary.loading'),
        description: t('summary.loadingDesc'),
      }}
      query={overviewQuery}
      retryAction={handleRetryAll}
      variant='card'>
      {(overview) => {
        const budget = budgetQuery.data?.items[0] ?? null
        const budgetPeriodContext = formatBudgetPeriodContext(budgetPeriod, t)
        const budgetProgress = getBudgetProgress(
          overview.totalSpendMinor,
          budget,
        )
        const isUpdating =
          overviewQuery.isFetching || comparisonQuery.isFetching

        return (
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <CardTitle>{title}</CardTitle>
                  <span className='mt-2 block font-mono text-[28px] leading-none font-extrabold tracking-tight text-foreground [font-variant-numeric:tabular-nums] sm:text-[30px]'>
                    {formatCurrencyMinor(
                      overview.totalSpendMinor,
                      overview.currencyCode,
                    )}
                  </span>
                </div>
                {showPeriodChip ? (
                  <div className='shrink-0'>
                    <PeriodChipLink />
                  </div>
                ) : null}
              </div>
              <CardDescription>
                {isUpdating
                  ? t('summary.updating')
                  : getComparisonLabel(
                      comparisonQuery.data,
                      overview.expenseCount ?? 0,
                      selectedPeriod.granularity,
                      t,
                    )}
              </CardDescription>
            </CardHeader>

            <CardContent className='grid gap-4'>
              {budgetProgress && isMonthPeriodSelection(selectedPeriod) ? (
                <div className='grid gap-2'>
                  <div className='h-3 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10'>
                    <span
                      className='block h-full rounded-full bg-linear-to-r from-primary to-[#7ca8ff] shadow-[0_6px_14px_rgba(63,124,255,0.22)]'
                      style={{
                        width: `${Math.min(budgetProgress.percentUsed, 100)}%`,
                      }}
                    />
                  </div>
                  <div className='flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground'>
                    {t('summary.budgetUsedPct', {
                      percent: budgetProgress.percentUsed,
                    })}
                    <span className='flex items-center gap-1'>
                      <span>
                        {budgetProgress.isOverBudget
                          ? t('summary.overPrefix')
                          : t('summary.remainingPrefix')}
                      </span>
                      <span className='font-mono text-foreground [font-variant-numeric:tabular-nums]'>
                        {formatCurrencyMinor(
                          Math.abs(budgetProgress.remainingMinor),
                          budget?.currencyCode ??
                            overview.currencyCode ??
                            'VND',
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className='text-xs leading-relaxed font-medium text-muted-foreground'>
                  {budget && isMonthPeriodSelection(selectedPeriod)
                    ? getHouseholdBudgetLabel(
                        overview.totalSpendMinor,
                        budget,
                        t,
                      )
                    : showBudgetPeriodContext
                      ? budgetPeriodContext
                      : t('summary.monthlyOnly')}
                </p>
              )}
            </CardContent>
          </Card>
        )
      }}
    </QueryState>
  )
}

const formatBudgetPeriodContext = (
  period: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => {
  const [year, month] = period.split('-')

  return year && month
    ? t('summary.monthlyBudget', { month, year })
    : t('summary.monthlyBudgetShort')
}
