'use client'

import type { Control, UseFormHandleSubmit } from 'react-hook-form'

import {
  AmountField,
  CategoryField,
  DateField,
  NoteField,
  SourceField,
  VisibilityField,
} from '@/components/expense/expense-form-fields'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import type { ExpenseGroupDTO } from '@/types/group'
import type { HouseholdDTO, HouseholdMemberDTO } from '@/types/household'
import type { CurrentUserProfileDTO } from '@/types/profile'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import type { QuickAddSubmitError } from './quick-add-defaults'
import { QuickAddHouseholdFields } from './quick-add-household-fields'
import { QuickAddSubmitError as QuickAddSubmitErrorBanner } from './quick-add-submit-error'

type QuickAddExpenseFormProps = {
  categories: ReferenceCategoryDTO[]
  control: Control<ExpenseFormInputValues>
  groups: ExpenseGroupDTO[]
  handleSubmit: UseFormHandleSubmit<ExpenseFormInputValues>
  households: HouseholdDTO[]
  inputRef: (node: HTMLInputElement | null) => void
  isSaving: boolean
  isSubmitting: boolean
  onCancel: () => void
  onSaveAsPrivate: () => void
  onSubmit: (values: ExpenseFormInputValues) => void | Promise<void>
  payerOptions: HouseholdMemberDTO[]
  profile?: CurrentUserProfileDTO
  submitError: QuickAddSubmitError | null
  watchedVisibility: ExpenseFormInputValues['visibility']
}

export function QuickAddExpenseForm({
  categories,
  control,
  groups,
  handleSubmit,
  households,
  inputRef,
  isSaving,
  isSubmitting,
  onCancel,
  onSaveAsPrivate,
  onSubmit,
  payerOptions,
  profile,
  submitError,
  watchedVisibility,
}: QuickAddExpenseFormProps) {
  return (
    <form className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
      <QuickAddSubmitErrorBanner
        error={submitError}
        isSaving={isSaving}
        onSaveAsPrivate={onSaveAsPrivate}
      />

      <FieldGroup>
        <AmountField
          control={control}
          inputRef={inputRef}
          isSubmitting={isSubmitting}
        />
        <SourceField control={control} isSubmitting={isSubmitting} />
        <CategoryField
          categories={categories}
          control={control}
          isSubmitting={isSubmitting}
        />
        <DateField control={control} isSubmitting={isSubmitting} />
        <NoteField control={control} isSubmitting={isSubmitting} />
        <VisibilityField control={control} isSubmitting={isSubmitting} />

        {watchedVisibility === 'household' ? (
          <QuickAddHouseholdFields
            control={control}
            groups={groups}
            households={households}
            isSubmitting={isSubmitting}
            payerOptions={payerOptions}
            profile={profile}
            watchedVisibility={watchedVisibility}
          />
        ) : null}
      </FieldGroup>

      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
        <Button disabled={isSaving} type='submit'>
          {t('expense.quickAdd.submit')}
        </Button>
      </div>
    </form>
  )
}
