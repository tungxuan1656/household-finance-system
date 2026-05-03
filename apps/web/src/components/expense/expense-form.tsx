'use client'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import type { ExpenseDTO } from '@/types/expense'
import type { ExpenseGroupDTO } from '@/types/group'
import type { HouseholdDTO, HouseholdMemberDTO } from '@/types/household'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import {
  AmountField,
  CategoryField,
  DateField,
  GroupField,
  HouseholdField,
  NoteField,
  PayerField,
  SourceField,
  TitleField,
  VisibilityField,
} from './expense-form-fields'
import { useExpenseForm } from './use-expense-form'

type ExpenseFormMode = 'create' | 'edit'

type ExpenseFormProps = {
  categories: ReferenceCategoryDTO[]
  households: HouseholdDTO[]
  groups?: ExpenseGroupDTO[]
  expenseId?: string
  initialValues?: ExpenseFormInputValues
  mode?: ExpenseFormMode
  onCancel?: () => void
  onError?: (error: Error) => void
  payerOptions?: HouseholdMemberDTO[]
  onSuccess?: (expense: ExpenseDTO) => void
}

export function ExpenseForm({
  categories,
  households,
  groups = [],
  expenseId,
  initialValues,
  mode = 'create',
  onCancel,
  onError,
  payerOptions = [],
  onSuccess,
}: ExpenseFormProps) {
  const { data: profile } = useCurrentUserProfileQuery()

  const { form, onSubmit, isSubmitting, watchedVisibility, defaultValues } =
    useExpenseForm({
      initialValues,
      mode,
      expenseId,
      onSuccess,
      onError,
    })

  return (
    <form
      className='flex flex-col gap-6'
      onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <AmountField control={form.control} isSubmitting={isSubmitting} />
        <CategoryField
          categories={categories}
          control={form.control}
          isSubmitting={isSubmitting}
        />
        <SourceField control={form.control} isSubmitting={isSubmitting} />
        <TitleField control={form.control} isSubmitting={isSubmitting} />
        <DateField control={form.control} isSubmitting={isSubmitting} />
        <NoteField control={form.control} isSubmitting={isSubmitting} />
        <VisibilityField control={form.control} isSubmitting={isSubmitting} />

        {watchedVisibility === 'household' && (
          <HouseholdField
            control={form.control}
            households={households}
            isSubmitting={isSubmitting}
          />
        )}

        {watchedVisibility === 'household' && groups.length > 0 && (
          <GroupField
            control={form.control}
            groups={groups}
            isSubmitting={isSubmitting}
          />
        )}

        <PayerField
          control={form.control}
          isSubmitting={isSubmitting}
          payerOptions={payerOptions}
          profile={profile}
          watchedVisibility={watchedVisibility}
        />
      </FieldGroup>

      <div className='flex items-center gap-2'>
        <Button
          disabled={isSubmitting}
          type='button'
          variant='outline'
          onClick={() => {
            if (onCancel) {
              onCancel()

              return
            }

            form.reset(defaultValues)
          }}>
          {t('common.actions.cancel')}
        </Button>
        <Button disabled={isSubmitting} type='submit'>
          {mode === 'edit'
            ? isSubmitting
              ? t('expense.updating')
              : t('expense.saveChanges')
            : isSubmitting
              ? t('expense.submitting')
              : t('expense.addTitle')}
        </Button>
      </div>
    </form>
  )
}
