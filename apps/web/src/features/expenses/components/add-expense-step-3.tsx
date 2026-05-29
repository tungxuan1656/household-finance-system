'use client'

import { ArrowLeft } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import type { ExpenseEntryHouseholdOption } from './expense-entry-options'
import type {
  ExpenseEntryFormErrors,
  ExpenseEntryFormState,
} from './use-expense-entry-form'

type Step3Props = {
  amountDisplay: string
  errors: ExpenseEntryFormErrors
  formState: ExpenseEntryFormState
  groups: ExpenseGroupDTO[]
  households: ExpenseEntryHouseholdOption[]
  isSubmitting: boolean
  onFieldChange: <K extends keyof ExpenseEntryFormState>(
    key: K,
    value: ExpenseEntryFormState[K],
  ) => void
  onStepChange: (step: 1 | 2 | 3) => void
  selectedCategory?: ReferenceCategoryDTO
}

export function AddExpenseStep3({
  amountDisplay,
  errors: _errors,
  formState,
  groups,
  households,
  isSubmitting,
  onFieldChange,
  onStepChange,
  selectedCategory,
}: Step3Props) {
  return (
    <div className='flex h-full flex-col gap-3'>
      {selectedCategory ? (
        <button
          className='flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          type='button'
          onClick={() => onStepChange(2)}>
          <ArrowLeft className='size-4' />
          <span>{getCategoryLabel(selectedCategory.key)}</span>
        </button>
      ) : null}

      <div className='flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-2'>
        <div className='flex items-center gap-2'>
          <img
            alt={selectedCategory ? getCategoryLabel(selectedCategory.key) : ''}
            className='size-5'
            src={selectedCategory?.iconUrl}
          />
          <span className='text-sm font-medium'>
            {selectedCategory
              ? getCategoryLabel(selectedCategory.key)
              : t('expense.category')}
          </span>
        </div>
        <span className='font-mono text-base font-medium text-destructive tabular-nums'>
          - {amountDisplay || '0'}.000 đ
        </span>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Card className='p-3'>
          <CardContent className='flex flex-col gap-2 p-0'>
            <p className='text-xs text-muted-foreground'>
              {t('expense.household')}
            </p>
            <NativeSelect
              className='h-8 text-xs'
              disabled={isSubmitting}
              value={formState.householdId}
              onChange={(event) =>
                onFieldChange('householdId', event.target.value)
              }>
              <NativeSelectOption value=''>
                {t('expense.quickAdd.step3.noHousehold')}
              </NativeSelectOption>
              {households.map((household) => (
                <NativeSelectOption key={household.id} value={household.id}>
                  {household.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </CardContent>
        </Card>

        <Card className='p-3'>
          <CardContent className='flex flex-col gap-2 p-0'>
            <p className='text-xs text-muted-foreground'>
              {t('expense.group')}
            </p>
            <NativeSelect
              className='h-8 text-xs'
              disabled={isSubmitting}
              value={formState.groupId}
              onChange={(event) =>
                onFieldChange('groupId', event.target.value)
              }>
              <NativeSelectOption value=''>
                {t('expense.quickAdd.step3.noGroup')}
              </NativeSelectOption>
              {groups.map((group) => (
                <NativeSelectOption key={group.id} value={group.id}>
                  {group.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
