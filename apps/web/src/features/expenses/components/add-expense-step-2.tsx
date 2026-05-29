'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
        className='rounded-full px-4'
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
  selectedCategory?: ReferenceCategoryDTO
}

export function AddExpenseStep2({
  amountDisplay,
  errors,
  formState,
  isSubmitting,
  onFieldChange,
  selectedCategory,
}: Step2Props) {
  const quickAmounts = getAddExpenseQuickAmounts()
  const quickSources = getAddExpenseQuickSources()
  const titleSuggestions = getAddExpenseTitleSuggestions(formState.categoryKey)

  return (
    <div className='flex flex-col gap-4'>
      {selectedCategory ? (
        <Card>
          <CardContent className='inline-flex w-fit items-center gap-2 px-3 py-2'>
            <img
              alt={getCategoryLabel(selectedCategory.key)}
              className='size-5'
              src={selectedCategory.iconUrl}
            />
            <span className='text-sm font-medium'>
              {getCategoryLabel(selectedCategory.key)}
            </span>
          </CardContent>
        </Card>
      ) : null}

      <div className='space-y-2'>
        <p className='text-sm font-medium'>Amount</p>
        <InputGroup className='h-auto rounded-[1.75rem] px-4 py-3'>
          <InputGroupInput
            aria-invalid={!!errors.amountInput}
            className='px-0 text-right font-mono text-3xl tabular-nums'
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
            <InputGroupText className='font-mono text-2xl tabular-nums'>
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

      <div className='space-y-2'>
        <p className='text-sm font-medium'>Source</p>
        <div className='flex flex-wrap gap-2'>
          {quickSources.map((source) => (
            <Button
              key={source.key}
              className='rounded-full px-4'
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

      <div className='space-y-2'>
        <p className='text-sm font-medium'>Note</p>
        <InputGroup className='h-auto rounded-[1.75rem]'>
          <InputGroupTextarea
            aria-invalid={!!errors.title}
            className='min-h-28'
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
