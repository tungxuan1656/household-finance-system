'use client'

import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ReferenceCategoryDTO, SourceKey } from '@/types/reference-data'

import {
  getAddExpenseQuickAmounts,
  getAddExpenseQuickSources,
  getAddExpenseTitleSuggestions,
} from './add-expense-flow-helpers'
import type {
  ExpenseEntryFormErrors,
  ExpenseEntryFormState,
} from './use-expense-entry-form'

const QuickChoiceRow = ({
  items,
  onSelect,
}: {
  items: string[]
  onSelect: (value: string) => void
}) => (
  <div className='flex flex-wrap gap-2'>
    {items.map((item) => (
      <Button
        key={item}
        className='rounded-full px-3'
        size='sm'
        type='button'
        variant='outline'
        onClick={() => onSelect(item)}>
        {item}
      </Button>
    ))}
  </div>
)

type Step2Props = {
  amountDisplay: string
  errors: ExpenseEntryFormErrors
  formState: ExpenseEntryFormState
  isSubmitting: boolean
  onFieldChange: <K extends keyof ExpenseEntryFormState>(
    key: K,
    value: ExpenseEntryFormState[K],
  ) => void
  onStepChange: (step: 1 | 2 | 3) => void
  selectedCategory?: ReferenceCategoryDTO
}

export function AddExpenseStep2({
  amountDisplay,
  errors,
  formState,
  isSubmitting,
  onFieldChange,
  onStepChange,
  selectedCategory,
}: Step2Props) {
  const quickAmounts = getAddExpenseQuickAmounts()
  const quickSources = getAddExpenseQuickSources()
  const titleSuggestions = getAddExpenseTitleSuggestions(formState.categoryKey)

  return (
    <div className='flex h-full flex-col gap-4'>
      {selectedCategory ? (
        <button
          className='flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          type='button'
          onClick={() => onStepChange(1)}>
          <ArrowLeft className='size-4' />
          <span>{getCategoryLabel(selectedCategory.key)}</span>
        </button>
      ) : null}

      <div className='space-y-1.5'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Amount</span>
        </div>
        <InputGroup className='h-auto rounded-2xl px-4 py-2.5'>
          <InputGroupInput
            aria-invalid={!!errors.amountInput}
            className='px-0 text-right font-mono text-2xl tabular-nums'
            disabled={isSubmitting}
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountDisplay}
            onChange={(event) =>
              onFieldChange('amountInput', event.target.value)
            }
          />
          <InputGroupAddon align='inline-end'>
            <InputGroupText className='font-mono text-xl tabular-nums'>
              .000 đ
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldError>{errors.amountInput}</FieldError>
      </div>

      <QuickChoiceRow
        items={quickAmounts.map((item) => `${item}k`)}
        onSelect={(value) =>
          onFieldChange('amountInput', value.replace('k', ''))
        }
      />

      <div className='space-y-1.5'>
        <p className='text-sm text-muted-foreground'>Source</p>
        <div className='flex flex-wrap gap-2'>
          {quickSources.map((source) => (
            <Button
              key={source.key}
              className='rounded-full px-3'
              size='sm'
              type='button'
              variant={
                formState.sourceKey === source.key ? 'default' : 'outline'
              }
              onClick={() =>
                onFieldChange('sourceKey', source.key as SourceKey)
              }>
              {source.label}
            </Button>
          ))}
        </div>
        <FieldError>{errors.sourceKey}</FieldError>
      </div>

      <div className='space-y-1.5'>
        <InputGroup className='h-auto rounded-2xl'>
          <InputGroupTextarea
            aria-invalid={!!errors.title}
            className='min-h-20 text-sm'
            disabled={isSubmitting}
            placeholder='Add a note...'
            value={formState.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
          />
        </InputGroup>
        <FieldError>{errors.title}</FieldError>
      </div>

      <QuickChoiceRow
        items={titleSuggestions.map((item) => `+ ${item}`)}
        onSelect={(value) => onFieldChange('title', value.replace(/^\+\s/, ''))}
      />
    </div>
  )
}
