'use client'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
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
  if (!currentHousehold || currentHousehold.role !== 'admin')
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('expense.trashForbidden')}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  if (deletedExpensesQuery.isLoading)
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-24 w-full' />
      </div>
    )
  if (deletedExpensesQuery.error)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('expense.loadError')}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )

  const items = deletedExpensesQuery.data?.items ?? []
  if (items.length === 0)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('expense.trashEmpty')}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )

  return (
    <div className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('expense.trashTitle')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('expense.trashDescription')}
        </p>
      </header>
      {items.map((expense) => (
        <Card key={expense.id}>
          <CardHeader className='flex flex-row items-start justify-between gap-3'>
            <div>
              <CardTitle>{expense.title}</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {formatCurrency(expense.amountMinor, expense.currencyCode)}
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
  )
}
