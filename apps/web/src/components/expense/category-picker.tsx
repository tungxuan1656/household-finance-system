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
  id?: string
}

export const CategoryPicker = ({
  categories,
  value,
  onValueChange,
  disabled = false,
  id,
}: CategoryPickerProps) => {
  const expenseCategories = categories.filter(
    (category) => category.kind === 'expense',
  )

  const iconByKey = new Map(
    expenseCategories.map((category) => [category.key, category.iconUrl]),
  )

  const expenseCategoryKeys = expenseCategories.map((category) => category.key)

  return (
    <Combobox
      id={id}
      itemToStringLabel={(categoryKey) => getCategoryLabel(categoryKey)}
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
          {(categoryKey) => {
            const label = getCategoryLabel(categoryKey)

            return (
              <ComboboxItem key={categoryKey} value={categoryKey}>
                <img
                  alt={label}
                  className='size-4 rounded-sm object-contain'
                  src={iconByKey.get(categoryKey)}
                />
                <span>{label}</span>
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
