'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/page-shell'
import { ExpenseDetailActions } from '@/features/expenses/components/expense-detail-actions'
import { ExpenseDetailCard } from '@/features/expenses/components/expense-detail-card'
import {
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
} from '@/features/expenses/hooks/use-expense'
import { useHouseholdsQuery } from '@/features/households/hooks/use-households'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

const BackToExpensesAction = () => (
  <Button asChild variant='outline'>
    <Link href={PATHS.EXPENSES}>{t('common.actions.backToOverview')}</Link>
  </Button>
)

const isExpenseStatusError = (error: unknown, status: number): boolean =>
  error instanceof ApiClientError && error.status === status

export const ExpenseDetailPage = () => {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const { data: currentUser } = useCurrentUserProfileQuery()
  const { data: households } = useHouseholdsQuery()
  const deleteExpense = useDeleteExpenseMutation()
  const expenseQuery = useExpenseDetailQuery(id)
  const { data: expense, isLoading, error, refetch } = expenseQuery
  const isAdmin =
    expense?.householdId != null &&
    (households?.items.some(
      (household) =>
        household.id === expense.householdId && household.role === 'admin',
    ) ??
      false)
  const handleDelete = () => {
    if (!expense) return

    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        toast.success(t('expense.deleteSuccess'))
        router.push(PATHS.EXPENSES)
      },
      onError: () => {
        toast.error(t('expense.deleteError'))
      },
    })
  }

  const detailActions = expense ? (
    <ExpenseDetailActions
      currentUserId={currentUser?.id}
      expense={expense}
      isAdmin={isAdmin}
      isDeleting={deleteExpense.isPending}
      onDelete={handleDelete}
      onEdit={() => router.push(PATHS.EDIT_EXPENSE.replace('[id]', expense.id))}
    />
  ) : null

  const isForbidden = isExpenseStatusError(error, 403)
  const isNotFound = !id || isExpenseStatusError(error, 404)
  const isGenericError =
    !isLoading && !isForbidden && !isNotFound && Boolean(error || !expense)
  const shouldShowContent =
    !isLoading &&
    !isForbidden &&
    !isNotFound &&
    !isGenericError &&
    Boolean(expense)
  const stateCustomAction =
    isForbidden || isNotFound ? <BackToExpensesAction /> : undefined
  const stateRetryAction = isGenericError ? refetch : undefined
  const stateErrorTitle = isForbidden
    ? t('expense.detail.forbidden')
    : t('expense.feed.error')
  const stateErrorDescription = isForbidden ? '' : t('expense.loadError')

  return (
    <PageShell
      showBack
      title={t('expense.detail.title')}
      onBack={() => router.back()}>
      <DataState
        customAction={stateCustomAction}
        emptyDescription=''
        emptyTitle={t('expense.detail.notFound')}
        errorDescription={stateErrorDescription}
        errorTitle={stateErrorTitle}
        isEmpty={isNotFound}
        isError={isForbidden || isGenericError}
        isLoading={isLoading}
        retryAction={stateRetryAction}
        title={t('expense.detail.title')}>
        {shouldShowContent && expense ? (
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <Button
                className='hidden sm:inline-flex'
                type='button'
                variant='outline'
                onClick={() => router.back()}>
                {t('app.householdDetail.actions.back')}
              </Button>
              {detailActions}
            </div>
            <ExpenseDetailCard expense={expense} />
          </div>
        ) : null}
      </DataState>
    </PageShell>
  )
}
