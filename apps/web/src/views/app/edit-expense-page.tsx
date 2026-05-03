'use client'

import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ExpenseForm } from '@/components/expense/expense-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenseDetailQuery } from '@/hooks/api/use-expense'
import {
  useHouseholdMembersQuery,
  useHouseholdsQuery,
} from '@/hooks/api/use-households'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'

function toMajorUnits(amountMinor: number, currencyCode: string): number {
  const fractionDigits =
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
    }).resolvedOptions().maximumFractionDigits ?? 0

  return amountMinor / 10 ** fractionDigits
}

function EditExpensePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const expenseQuery = useExpenseDetailQuery(id)
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()
  const householdMembersQuery = useHouseholdMembersQuery(
    expenseQuery.data?.householdId ?? undefined,
  )

  const isLoading =
    expenseQuery.isLoading ||
    categoriesQuery.isLoading ||
    householdsQuery.isLoading ||
    householdMembersQuery.isLoading
  const error =
    expenseQuery.error ||
    categoriesQuery.error ||
    householdsQuery.error ||
    householdMembersQuery.error ||
    !id

  const categories = categoriesQuery.data?.items ?? []
  const households = householdsQuery.data?.items ?? []
  const payerOptions = householdMembersQuery.data?.items ?? []
  const expense = expenseQuery.data

  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-24 w-full' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !expense || !id) {
    return (
      <Card>
        <CardContent className='flex items-center justify-between gap-2 pt-6'>
          <p className='text-sm text-destructive'>{t('expense.loadError')}</p>
          <Button type='button' variant='outline' onClick={() => router.back()}>
            {t('app.householdDetail.actions.back')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-col gap-1'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('expense.editTitle')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('expense.editDescription')}
        </p>
      </header>

      <ExpenseForm
        categories={categories}
        expenseId={id}
        households={households}
        initialValues={{
          amount: toMajorUnits(expense.amountMinor, expense.currencyCode),
          categoryKey: expense.categoryKey,
          sourceKey: expense.sourceKey,
          title: expense.title,
          occurredAt: expense.occurredAt,
          note: expense.note ?? '',
          payerUserId: expense.payerUserId ?? undefined,
          visibility: expense.visibility,
          householdId: expense.householdId ?? undefined,
        }}
        mode='edit'
        payerOptions={payerOptions}
        onCancel={() => router.back()}
        onSuccess={(updatedExpense) => {
          toast.success(t('expense.updateSuccess'))
          router.push(`/expenses/${updatedExpense.id}`)
        }}
      />
    </div>
  )
}

export { EditExpensePage }
