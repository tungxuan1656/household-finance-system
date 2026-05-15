'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  const iconByKey = new Map(
    expenseCategories.map((category) => [category.key, category.iconUrl]),
  )
  const selectedLabel = value ? getCategoryLabel(value) : null
  const selectedIcon = value ? iconByKey.get(value) : null

  return (
    <Select
      disabled={disabled}
      value={value ?? undefined}
      onValueChange={(nextValue) => {
        onValueChange(nextValue as CategoryKey)
      }}>
      <SelectTrigger
        aria-label={t('app.expenseReference.categoryPicker.ariaLabel')}
        className='w-full'
        id={id}
        size={size}>
        {selectedLabel ? (
          <span className='flex items-center gap-1.5 truncate'>
            {selectedIcon ? (
              <img
                alt={selectedLabel}
                className='size-4 rounded-sm object-contain'
                src={selectedIcon}
              />
            ) : null}
            <span className='truncate'>{selectedLabel}</span>
          </span>
        ) : (
          <SelectValue
            placeholder={t('app.expenseReference.categoryPicker.placeholder')}
          />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {expenseCategories.map((category) => {
            const label = getCategoryLabel(category.key)

            return (
              <SelectItem key={category.key} value={category.key}>
                <img
                  alt={label}
                  className='size-4 rounded-sm object-contain'
                  src={category.iconUrl}
                />
                <span>{label}</span>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
