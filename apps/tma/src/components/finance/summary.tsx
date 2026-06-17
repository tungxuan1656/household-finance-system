import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Card, DataState, Eyebrow, MoneyLabel } from '@/components/ui'
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
  const overview = overviewQuery.data
  const budget = budgetQuery.data?.items[0] ?? null
  const budgetPeriodContext = formatBudgetPeriodContext(budgetPeriod, t)
  const budgetProgress = overview
    ? getBudgetProgress(overview.totalSpendMinor, budget)
    : null
  const isLoading =
    !overview &&
    (overviewQuery.isLoading ||
      comparisonQuery.isLoading ||
      budgetQuery.isLoading)
  const isError =
    !overview && Boolean(overviewQuery.error || comparisonQuery.error)

  return (
    <DataState
      errorDescription={t('summary.loadErrorDesc')}
      errorTitle={t('summary.loadError')}
      isError={isError}
      isLoading={isLoading}
      loadingDescription={t('summary.loadingDesc')}
      loadingTitle={t('summary.loading')}
      retryAction={async () => {
        await Promise.all([
          overviewQuery.refetch(),
          comparisonQuery.refetch(),
          budgetQuery.refetch(),
        ])
      }}>
      <Card className='grid gap-4 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <Eyebrow>{title}</Eyebrow>
            <MoneyLabel className='mt-1 block text-[30px] leading-none font-extrabold tracking-normal'>
              {overview
                ? formatCurrencyMinor(
                    overview.totalSpendMinor,
                    overview.currencyCode,
                  )
                : '-'}
            </MoneyLabel>
          </div>
          {showPeriodChip ? <PeriodChipLink /> : null}
        </div>

        <div className='text-xs font-semibold text-tma-text-muted'>
          {overviewQuery.isFetching || comparisonQuery.isFetching
            ? t('summary.updating')
            : getComparisonLabel(
                comparisonQuery.data,
                overview?.expenseCount ?? 0,
                selectedPeriod.granularity,
                t,
              )}
        </div>

        {budgetProgress && isMonthPeriodSelection(selectedPeriod) ? (
          <div className='grid gap-2'>
            <div className='h-3 overflow-hidden rounded-full bg-black/[0.07]'>
              <span
                className='block h-full rounded-full bg-linear-to-r from-tma-primary to-[#7ca8ff] shadow-[0_6px_14px_rgba(63,124,255,0.22)]'
                style={{
                  width: `${Math.min(budgetProgress.percentUsed, 100)}%`,
                }}
              />
            </div>
            <div className='flex items-center justify-between gap-3 text-xs font-semibold text-tma-text-muted'>
              {t('summary.budgetUsedPct', {
                percent: budgetProgress.percentUsed,
              })}
              <span>
                {budgetProgress.isOverBudget
                  ? t('summary.overPrefix')
                  : t('summary.remainingPrefix')}
                <MoneyLabel>
                  {formatCurrencyMinor(
                    Math.abs(budgetProgress.remainingMinor),
                    budget?.currencyCode ?? overview?.currencyCode ?? 'VND',
                  )}
                </MoneyLabel>
              </span>
            </div>
          </div>
        ) : (
          <div className='text-xs font-semibold text-tma-text-muted'>
            {budget && isMonthPeriodSelection(selectedPeriod)
              ? getHouseholdBudgetLabel(overview?.totalSpendMinor, budget, t)
              : showBudgetPeriodContext
                ? budgetPeriodContext
                : t('summary.monthlyOnly')}
          </div>
        )}
      </Card>
    </DataState>
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
