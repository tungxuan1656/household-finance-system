'use client'

import { DataState } from '@/components/shared/data-state'
import type {
  BudgetStatusDTO,
  BudgetStatusErrorMessage,
} from '@/features/budgets/types/budget'
import { t } from '@/lib/i18n/t'

import { BudgetStatusCard } from './budget-status-card'

type BudgetStatusPanelProps = {
  status?: BudgetStatusDTO | null
  isLoading?: boolean
  errorMessage?: BudgetStatusErrorMessage | null
  onRetry?: () => unknown
}
function BudgetStatusPanel({
  status,
  isLoading,
  errorMessage,
  onRetry,
}: BudgetStatusPanelProps) {
  const isEmpty = !isLoading && !errorMessage && !status

  return (
    <DataState
      emptyDescription={t('budgets.status.empty.description')}
      emptyTitle={t('budgets.status.empty.title')}
      errorDescription={errorMessage ? t(errorMessage) : ''}
      errorTitle={t('budgets.status.error.title')}
      isEmpty={isEmpty}
      isError={Boolean(errorMessage)}
      isLoading={isLoading}
      retryAction={errorMessage ? onRetry : undefined}
      title={t('budgets.status.title')}>
      {status ? <BudgetStatusCard status={status} /> : null}
    </DataState>
  )
}

export { BudgetStatusPanel }
