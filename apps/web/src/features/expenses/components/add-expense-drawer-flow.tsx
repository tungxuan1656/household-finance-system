'use client'

import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import {
  ADD_EXPENSE_STEP_TOTAL,
  type AddExpenseStep,
  canAdvanceAddExpenseCategoryStep,
  canAdvanceAddExpenseInfoStep,
} from './add-expense-flow-helpers'
import { AddExpenseStep1 } from './add-expense-step-1'
import { AddExpenseStep2 } from './add-expense-step-2'
import { AddExpenseStep3 } from './add-expense-step-3'
import type {
  ExpenseEntryCategoryOption,
  ExpenseEntryHouseholdOption,
} from './expense-entry-options'
import type {
  ExpenseEntryFormErrors,
  ExpenseEntryFormState,
} from './use-expense-entry-form'

export type { ExpenseEntryCategoryOption, ExpenseEntryHouseholdOption }

type AddExpenseDrawerFlowProps = {
  amountDisplay: string
  categorySearch: string
  errors: ExpenseEntryFormErrors
  filteredCategories: ExpenseEntryCategoryOption[]
  formState: ExpenseEntryFormState
  groups: ExpenseGroupDTO[]
  households: ExpenseEntryHouseholdOption[]
  isSubmitting: boolean
  onCategorySearchChange: (value: string) => void
  onClose: () => void
  onFieldChange: <K extends keyof ExpenseEntryFormState>(
    key: K,
    value: ExpenseEntryFormState[K],
  ) => void
  onSubmit: () => void
  onStepChange: (step: AddExpenseStep) => void
  selectedCategory?: ReferenceCategoryDTO
  step: AddExpenseStep
}

const StepBadge = ({ step }: { step: AddExpenseStep }) => (
  <span className='rounded-full border border-border/80 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
    {step}/{ADD_EXPENSE_STEP_TOTAL}
  </span>
)

const getStepTitle = (step: AddExpenseStep) => {
  if (step === 1) return t('expense.quickAdd.step1.title')
  if (step === 2) return t('expense.quickAdd.step2.title')

  return t('expense.quickAdd.step3.title')
}

export const AddExpenseDrawerFlow = ({
  amountDisplay,
  errors,
  filteredCategories,
  formState,
  groups,
  households,
  isSubmitting,
  onCategorySearchChange,
  onClose,
  onFieldChange,
  onSubmit,
  onStepChange,
  selectedCategory,
  step,
}: AddExpenseDrawerFlowProps) => {
  return (
    <DrawerContent className='mx-auto flex h-[85vh] w-full max-w-md flex-col before:inset-0 before:rounded-t-[2rem] before:border-border/70 before:bg-popover'>
      <div className='mt-1 flex items-center justify-between gap-3 px-4 pb-2'>
        <div className='flex items-center gap-3'>
          <div>
            <h2 className='text-xl font-semibold'>{getStepTitle(step)}</h2>
          </div>
          <StepBadge step={step} />
        </div>
        <DrawerClose asChild>
          <Button
            aria-label={t('common.actions.close')}
            size='icon'
            type='button'
            variant='ghost'
            onClick={onClose}>
            <XIcon className='size-4' />
          </Button>
        </DrawerClose>
      </div>

      <div className='flex-1 overflow-y-auto px-4 pb-4'>
        {step === 1 && (
          <AddExpenseStep1
            errors={errors}
            filteredCategories={filteredCategories}
            formState={formState}
            isSubmitting={isSubmitting}
            onCategorySearchChange={onCategorySearchChange}
            onFieldChange={onFieldChange}
            onStepChange={onStepChange}
          />
        )}

        {step === 2 && (
          <AddExpenseStep2
            amountDisplay={amountDisplay}
            errors={errors}
            formState={formState}
            isSubmitting={isSubmitting}
            selectedCategory={selectedCategory}
            onFieldChange={onFieldChange}
            onStepChange={onStepChange}
          />
        )}

        {step === 3 && (
          <AddExpenseStep3
            amountDisplay={amountDisplay}
            errors={errors}
            formState={formState}
            groups={groups}
            households={households}
            isSubmitting={isSubmitting}
            selectedCategory={selectedCategory}
            onFieldChange={onFieldChange}
            onStepChange={onStepChange}
          />
        )}
      </div>

      <DrawerFooter className='border-t border-border/70 px-4 pt-3 pb-safe'>
        <div className='flex items-center gap-3'>
          {step > 1 && step < 3 ? (
            <Button
              className='flex-1'
              type='button'
              variant='outline'
              onClick={() => onStepChange((step - 1) as AddExpenseStep)}>
              {t('common.actions.back')}
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              className='flex-1'
              disabled={
                step === 1
                  ? !canAdvanceAddExpenseCategoryStep(formState)
                  : !canAdvanceAddExpenseInfoStep(formState)
              }
              type='button'
              onClick={() => onStepChange((step + 1) as AddExpenseStep)}>
              {t('common.actions.continue')}
            </Button>
          ) : (
            <>
              <Button
                className='flex-1'
                type='button'
                variant='outline'
                onClick={() => onStepChange((step - 1) as AddExpenseStep)}>
                {t('common.actions.back')}
              </Button>
              <Button
                className='flex-1'
                disabled={isSubmitting}
                type='button'
                onClick={onSubmit}>
                {isSubmitting
                  ? t('expense.submitting')
                  : t('common.actions.finish')}
              </Button>
            </>
          )}
        </div>
      </DrawerFooter>
    </DrawerContent>
  )
}
