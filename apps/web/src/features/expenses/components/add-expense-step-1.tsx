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
      'flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl border border-border/70 bg-card px-2 py-3 text-center transition-colors',
      isSelected
        ? 'border-primary bg-primary text-primary-foreground'
        : 'hover:border-primary/50 hover:bg-accent/40',
    )}
    type='button'
    onClick={onSelect}>
    <span
      className={cn(
        'flex size-11 items-center justify-center rounded-2xl',
        isSelected ? 'bg-primary-foreground/15' : 'bg-background/20',
      )}
      style={
        !isSelected ? { backgroundColor: `${category.color}1F` } : undefined
      }>
      <img
        alt={getCategoryLabel(category.key)}
        className='size-6'
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
}

export function AddExpenseStep1({
  errors,
  filteredCategories,
  formState,
  isSubmitting,
  onCategorySearchChange,
  onFieldChange,
}: Step1Props) {
  return (
    <div className='flex flex-col gap-4'>
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

      <div className='grid grid-cols-3 gap-3'>
        {filteredCategories.map((category) => (
          <CategoryTile
            key={category.key}
            category={category}
            isSelected={formState.categoryKey === category.key}
            onSelect={() => onFieldChange('categoryKey', category.key)}
          />
        ))}
      </div>
      <FieldError>{errors.categoryKey}</FieldError>
    </div>
  )
}
