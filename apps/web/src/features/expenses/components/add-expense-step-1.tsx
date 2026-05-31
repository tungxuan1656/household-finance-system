'use client'

import { CalendarIcon, SearchIcon } from 'lucide-react'

import { FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import { cn } from '@/utils/cn'

import type { ExpenseEntryCategoryOption } from './expense-entry-options'
import type {
  ExpenseEntryFormErrors,
  ExpenseEntryFormState,
} from './use-expense-entry-form'

const CategoryTile = ({
  category,
  isSelected,
  onSelect,
}: {
  category: ExpenseEntryCategoryOption
  isSelected: boolean
  onSelect: () => void
}) => (
  <button
    className={cn(
      'flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2 text-center transition-colors',
      isSelected
        ? 'border-primary bg-primary/10 text-primary-foreground'
        : 'hover:border-primary/50 hover:bg-accent/40',
    )}
    type='button'
    onClick={onSelect}>
    <span
      className={cn(
        'flex size-10 items-center justify-center rounded-xl',
        isSelected ? 'bg-primary-foreground/15' : 'bg-background/20',
      )}
      style={
        !isSelected ? { backgroundColor: `${category.color}1F` } : undefined
      }>
      <img
        alt={getCategoryLabel(category.key)}
        className='size-5'
        src={category.iconUrl}
      />
    </span>
    <span className='text-xs leading-tight font-medium'>
      {getCategoryLabel(category.key)}
    </span>
  </button>
)

type Step1Props = {
  errors: ExpenseEntryFormErrors
  filteredCategories: ExpenseEntryCategoryOption[]
  formState: ExpenseEntryFormState
  isSubmitting: boolean
  onCategorySearchChange: (value: string) => void
  onFieldChange: <K extends keyof ExpenseEntryFormState>(
    key: K,
    value: ExpenseEntryFormState[K],
  ) => void
  onStepChange: (step: 1 | 2 | 3) => void
}

export function AddExpenseStep1({
  errors,
  filteredCategories,
  formState,
  isSubmitting,
  onCategorySearchChange,
  onFieldChange,
  onStepChange,
}: Step1Props) {
  const handleCategorySelect = (categoryKey: string) => {
    onFieldChange(
      'categoryKey',
      categoryKey as ExpenseEntryCategoryOption['key'],
    )

    onStepChange(2)
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <InputGroup>
        <InputGroupAddon>
          <CalendarIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-invalid={!!errors.occurredOn}
          disabled={isSubmitting}
          type='date'
          value={formState.occurredOn}
          onChange={(event) => onFieldChange('occurredOn', event.target.value)}
        />
      </InputGroup>
      <FieldError>{errors.occurredOn}</FieldError>

      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder='Search categories'
          type='search'
          value={formState.categoryKey as string}
          onChange={(event) => onCategorySearchChange(event.target.value)}
        />
      </InputGroup>

      <div className='flex flex-row flex-wrap gap-2'>
        {filteredCategories.map((category) => (
          <CategoryTile
            key={category.key}
            category={category}
            isSelected={formState.categoryKey === category.key}
            onSelect={() => handleCategorySelect(category.key)}
          />
        ))}
      </div>
      <FieldError>{errors.categoryKey}</FieldError>
    </div>
  )
}
