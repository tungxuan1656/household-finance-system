'use client'

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
  selectedCategory,
}: Step3Props) {
  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardContent className='flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-3'>
            {selectedCategory ? (
              <img
                alt={getCategoryLabel(selectedCategory.key)}
                className='size-6'
                src={selectedCategory.iconUrl}
              />
            ) : null}
            <div className='min-w-0'>
              <p className='text-sm font-medium'>
                {selectedCategory
                  ? getCategoryLabel(selectedCategory.key)
                  : t('expense.category')}
              </p>
              <p className='truncate text-xs text-muted-foreground'>
                {formState.title || t('expense.quickAdd.step2.notePlaceholder')}
              </p>
            </div>
          </div>
          <span className='font-mono text-base font-medium text-destructive tabular-nums'>
            - {amountDisplay || '0'}.000 đ
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='space-y-2 px-4 py-3'>
          <p className='text-sm font-medium'>{t('expense.household')}</p>
          <NativeSelect
            className='w-full'
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

      <Card>
        <CardContent className='space-y-2 px-4 py-3'>
          <p className='text-sm font-medium'>{t('expense.group')}</p>
          <NativeSelect
            className='w-full'
            disabled={isSubmitting}
            value={formState.groupId}
            onChange={(event) => onFieldChange('groupId', event.target.value)}>
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
  )
}
