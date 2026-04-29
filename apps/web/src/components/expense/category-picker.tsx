'use client'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { CategoryKey, ReferenceCategoryDTO } from '@/types/reference-data'

type CategoryPickerProps = {
  categories: ReferenceCategoryDTO[]
  value: CategoryKey | null
  onValueChange: (value: CategoryKey | null) => void
  disabled?: boolean
}

export const CategoryPicker = ({
  categories,
  value,
  onValueChange,
  disabled = false,
}: CategoryPickerProps) => {
  const expenseCategoryKeys = categories
    .filter((category) => category.kind === 'expense')
    .map((category) => category.key)

  return (
    <Combobox
      items={expenseCategoryKeys}
      value={value}
      onValueChange={(nextValue) => {
        onValueChange(nextValue as CategoryKey | null)
      }}>
      <ComboboxInput
        showClear
        aria-label={t('app.expenseReference.categoryPicker.ariaLabel')}
        disabled={disabled}
        placeholder={t('app.expenseReference.categoryPicker.placeholder')}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {t('app.expenseReference.categoryPicker.empty')}
        </ComboboxEmpty>
        <ComboboxList>
          {(categoryKey) => (
            <ComboboxItem key={categoryKey} value={categoryKey}>
              {getCategoryLabel(categoryKey)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
