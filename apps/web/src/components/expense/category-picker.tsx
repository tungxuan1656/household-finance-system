'use client'

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { CategoryKey, ReferenceCategoryDTO } from '@/types/reference-data'

type CategoryPickerProps = {
  categories: ReferenceCategoryDTO[]
  value: CategoryKey | null
  onValueChange: (value: CategoryKey | null) => void
  disabled?: boolean
  id?: string
  size?: 'sm' | 'default'
}

export const CategoryPicker = ({
  categories,
  value,
  onValueChange,
  disabled = false,
  id,
  size = 'default',
}: CategoryPickerProps) => {
  const expenseCategories = categories.filter(
    (category) => category.kind === 'expense',
  )

  return (
    <NativeSelect
      disabled={disabled}
      id={id}
      size={size}
      value={value ?? ''}
      onChange={(event) => {
        onValueChange(
          event.target.value ? (event.target.value as CategoryKey) : null,
        )
      }}>
      <NativeSelectOption value=''>
        {t('app.expenseReference.categoryPicker.placeholder')}
      </NativeSelectOption>
      {expenseCategories.map((category) => (
        <NativeSelectOption key={category.key} value={category.key}>
          {getCategoryLabel(category.key)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
