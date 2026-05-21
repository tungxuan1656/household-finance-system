'use client'

import { toast } from 'sonner'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageShell } from '@/components/ui/page-shell'
import {
  useDeletedExpenseListQuery,
  useRestoreExpenseMutation,
} from '@/features/expenses/hooks/use-expense'
import { t } from '@/lib/i18n/t'
import { useHouseholdStore } from '@/stores/household.store'
import { formatCurrency } from '@/utils/currency/format'

export function ExpenseTrashPage() {
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const restoreExpense = useRestoreExpenseMutation()
  const deletedExpensesQuery = useDeletedExpenseListQuery(currentHousehold?.id)
  const isForbidden = !currentHousehold || currentHousehold.role !== 'admin'
  const isLoading = !isForbidden && deletedExpensesQuery.isLoading
  const isError = !isForbidden && Boolean(deletedExpensesQuery.error)

  const items = deletedExpensesQuery.data?.items ?? []
  const isEmpty = !isForbidden && !isLoading && !isError && items.length === 0
  const shouldShowContent =
    !isForbidden && !isLoading && !isError && items.length > 0

  return (
    <PageShell title={t('expense.trashTitle')}>
      <DataState
        emptyDescription=''
        emptyTitle={t('expense.trashEmpty')}
        errorDescription=''
        errorTitle={
          isForbidden ? t('expense.trashForbidden') : t('expense.loadError')
        }
        isEmpty={isEmpty}
        isError={isForbidden || isError}
        isLoading={isLoading}
        retryAction={isError ? deletedExpensesQuery.refetch : undefined}>
        {shouldShowContent ? (
          <div className='flex flex-col gap-4'>
            <p className='text-sm text-muted-foreground'>
              {t('expense.trashDescription')}
            </p>
            {items.map((expense) => (
              <Card key={expense.id}>
                <CardHeader className='flex flex-row items-start justify-between gap-3'>
                  <div>
                    <CardTitle>{expense.title}</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      {formatCurrency(
                        expense.amountMinor,
                        expense.currencyCode,
                      )}
                    </p>
                  </div>
                  <Button
                    disabled={restoreExpense.isPending}
                    type='button'
                    variant='outline'
                    onClick={() => {
                      restoreExpense.mutate(expense.id, {
                        onSuccess: () => {
                          toast.success(t('expense.restoreSuccess'))
                        },
                        onError: () => {
                          toast.error(t('expense.restoreError'))
                        },
                      })
                    }}>
                    {t('expense.restoreAction')}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>
                    {expense.note ?? t('expense.note')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </DataState>
    </PageShell>
  )
}
