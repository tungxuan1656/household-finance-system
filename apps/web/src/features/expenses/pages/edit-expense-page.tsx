'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ExpenseEntryForm,
  filterExpenseEntryCategories,
  mergeExpenseEntryGroups,
  useExpenseEntryForm,
} from '@/features/expenses/components'
import { useExpenseDetailQuery } from '@/features/expenses/hooks/use-expense'
import { useExpenseGroupListQuery } from '@/features/groups/hooks/use-groups'
import { useHouseholdsQuery } from '@/features/households/hooks/use-households'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'

export function EditExpensePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const expenseQuery = useExpenseDetailQuery(id)
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = useExpenseGroupListQuery(undefined)
  const expense = expenseQuery.data
  const entryForm = useExpenseEntryForm({
    mode: 'edit',
    open: true,
    expense,
    expenseId: id,
    callbacks: {
      onSuccess: (updatedExpense) => {
        toast.success(t('expense.updateSuccess'))
        router.push(`/expenses/${updatedExpense.id}`)
      },
      onError: () => {
        toast.error(t('expense.updateError'))
      },
    },
  })
  const selectedHouseholdId = entryForm.formState.householdId || undefined
  const householdGroupsQuery = useExpenseGroupListQuery(selectedHouseholdId)
  const isLoading =
    expenseQuery.isLoading ||
    categoriesQuery.isLoading ||
    householdsQuery.isLoading ||
    personalGroupsQuery.isLoading ||
    householdGroupsQuery.isLoading
  const hasError =
    !id ||
    !!expenseQuery.error ||
    !!categoriesQuery.error ||
    !!householdsQuery.error ||
    !!personalGroupsQuery.error ||
    !!householdGroupsQuery.error
  const categories = useMemo(
    () => filterExpenseEntryCategories(categoriesQuery.data?.items ?? []),
    [categoriesQuery.data?.items],
  )
  const households = householdsQuery.data?.items ?? []
  const personalGroups = personalGroupsQuery.data?.items ?? []
  const householdGroups = householdGroupsQuery.data?.items ?? []
  const groups = useMemo(
    () =>
      mergeExpenseEntryGroups(
        personalGroups,
        selectedHouseholdId ? householdGroups : [],
      ),
    [householdGroups, personalGroups, selectedHouseholdId],
  )
  if (isLoading)
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
  if (hasError || !expense || !id)
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
      <ExpenseEntryForm
        amountDisplay={entryForm.amountDisplay}
        categories={categories}
        errors={entryForm.errors}
        formId='edit-expense-form'
        formState={entryForm.formState}
        groups={groups}
        households={households}
        isSubmitting={entryForm.isSubmitting}
        setField={entryForm.setField}
        titlePlaceholder={entryForm.titlePlaceholder}
        onSubmit={entryForm.handleSubmit}
      />
      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          {t('common.actions.cancel')}
        </Button>
        <Button
          disabled={entryForm.isSubmitting}
          form='edit-expense-form'
          type='submit'>
          {entryForm.isSubmitting
            ? t('expense.updating')
            : t('expense.saveChanges')}
        </Button>
      </div>
    </div>
  )
}
