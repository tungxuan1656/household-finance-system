import { QueryState } from '@/components/shared/query-state'

import { type useBudgetStatusQuery } from '../api'
import { BudgetProgressSection } from '../components/budget-progress-section'
import { getBudgetProgress } from '../presentation'
import type { BudgetStatusDTO } from '../types'

type BudgetStatusBlockProps = {
  statusQuery: ReturnType<typeof useBudgetStatusQuery>
  t: (key: string, options?: Record<string, unknown>) => string
}

export const BudgetStatusBlock = ({
  statusQuery,
  t,
}: BudgetStatusBlockProps) => (
  <QueryState
    error={{
      title: t('budgets.detail.loadError'),
      description: t('budgets.detail.loadErrorDesc'),
    }}
    isEmpty={(data: BudgetStatusDTO) => !data}
    pending={{
      title: t('budgets.detail.loading'),
      description: t('budgets.detail.loadingDesc'),
    }}
    query={statusQuery}
    retryAction={() => void statusQuery.refetch()}
    variant='card'>
    {(status: BudgetStatusDTO) => {
      const progress = getBudgetProgress(
        status.totalActualMinor,
        status.totalPlannedMinor,
      )
      const isOver = status.totalRemainingMinor < 0

      return (
        <BudgetProgressSection
          isOver={isOver}
          progress={progress}
          status={status}
          t={t}
        />
      )
    }}
  </QueryState>
)
