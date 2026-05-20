'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/page-shell'
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

  return (
    <PageShell
      showBack
      title={t('expense.editTitle')}
      onBack={() => router.back()}>
      <DataState
        customAction={
          <Button type='button' variant='outline' onClick={() => router.back()}>
            {t('app.householdDetail.actions.back')}
          </Button>
        }
        errorDescription=''
        errorTitle={t('expense.loadError')}
        isError={hasError || !expense || !id}
        isLoading={isLoading}
        title={t('expense.editTitle')}>
        <div className='flex flex-col gap-6'>
          <p className='text-sm text-muted-foreground'>
            {t('expense.editDescription')}
          </p>
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
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}>
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
      </DataState>
    </PageShell>
  )
}
