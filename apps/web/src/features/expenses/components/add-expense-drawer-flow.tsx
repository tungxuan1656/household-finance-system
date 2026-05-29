'use client'

import { CalendarIcon, SearchIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer'
import { FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ReferenceCategoryDTO, SourceKey } from '@/types/reference-data'
import { cn } from '@/utils/cn'

import {
  ADD_EXPENSE_STEP_TOTAL,
  type AddExpenseStep,
  canAdvanceAddExpenseCategoryStep,
  canAdvanceAddExpenseInfoStep,
  getAddExpenseQuickAmounts,
  getAddExpenseQuickSources,
  getAddExpenseTitleSuggestions,
} from './add-expense-flow-helpers'
import type {
  ExpenseEntryCategoryOption,
  ExpenseEntryHouseholdOption,
} from './expense-entry-options'
import type {
  ExpenseEntryFormErrors,
  ExpenseEntryFormState,
} from './use-expense-entry-form'

type AddExpenseDrawerFlowProps = {
  amountDisplay: string
  categorySearch: string
  errors: ExpenseEntryFormErrors
  filteredCategories: ExpenseEntryCategoryOption[]
  formState: ExpenseEntryFormState
  groups: ExpenseGroupDTO[]
  households: ExpenseEntryHouseholdOption[]
  isSubmitting: boolean
  onCategorySearchChange: (value: string) => void
  onClose: () => void
  onFieldChange: <K extends keyof ExpenseEntryFormState>(
    key: K,
    value: ExpenseEntryFormState[K],
  ) => void
  onSubmit: () => void
  onStepChange: (step: AddExpenseStep) => void
  selectedCategory?: ReferenceCategoryDTO
  step: AddExpenseStep
}

const StepBadge = ({ step }: { step: AddExpenseStep }) => (
  <span className='rounded-full border border-border/80 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
    {step}/{ADD_EXPENSE_STEP_TOTAL}
  </span>
)

const getStepTitle = (step: AddExpenseStep) => {
  if (step === 1) return t('expense.quickAdd.step1.title')
  if (step === 2) return t('expense.quickAdd.step2.title')

  return t('expense.quickAdd.step3.title')
}

const CategoryTile = ({
  category,
  isSelected,
  onSelect,
}: {
  category: ExpenseEntryCategoryOption
  isSelected: boolean
  onSelect: () => void
}) => {
  return (
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
}

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

export const AddExpenseDrawerFlow = ({
  amountDisplay,
  categorySearch,
  errors,
  filteredCategories,
  formState,
  groups,
  households,
  isSubmitting,
  onCategorySearchChange,
  onClose,
  onFieldChange,
  onSubmit,
  onStepChange,
  selectedCategory,
  step,
}: AddExpenseDrawerFlowProps) => {
  const quickSources = getAddExpenseQuickSources()
  const titleSuggestions = getAddExpenseTitleSuggestions(formState.categoryKey)
  const quickAmounts = getAddExpenseQuickAmounts()

  return (
    <DrawerContent className='mx-auto w-full max-w-md p-4 before:inset-0 before:rounded-t-[2rem] before:border-border/70 before:bg-popover'>
      <div className='mt-1 flex items-center justify-between gap-3 px-2 pb-3'>
        <div className='flex items-center gap-3'>
          <div>
            <h2 className='text-xl font-semibold'>{getStepTitle(step)}</h2>
          </div>
          <StepBadge step={step} />
        </div>
        <DrawerClose asChild>
          <Button
            aria-label={t('common.actions.close')}
            size='icon'
            type='button'
            variant='ghost'
            onClick={onClose}>
            <XIcon className='size-4' />
          </Button>
        </DrawerClose>
      </div>

      <div className='overflow-y-auto px-2 pb-4'>
        {step === 1 ? (
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
                onChange={(event) =>
                  onFieldChange('occurredOn', event.target.value)
                }
              />
            </InputGroup>
            <FieldError>{errors.occurredOn}</FieldError>

            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t('expense.quickAdd.step1.searchPlaceholder')}
                type='search'
                value={categorySearch}
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
        ) : null}

        {step === 2 ? (
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
              <p className='text-sm font-medium'>{t('expense.amount')}</p>
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
              <p className='text-sm font-medium'>{t('expense.source')}</p>
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
              <p className='text-sm font-medium'>{t('expense.note')}</p>
              <InputGroup className='h-auto rounded-[1.75rem]'>
                <InputGroupTextarea
                  aria-invalid={!!errors.title}
                  className='min-h-28'
                  disabled={isSubmitting}
                  placeholder={t('expense.quickAdd.step2.notePlaceholder')}
                  value={formState.title}
                  onChange={(event) =>
                    onFieldChange('title', event.target.value)
                  }
                />
              </InputGroup>
              <FieldError>{errors.title}</FieldError>
            </div>

            <QuickChoiceRow
              items={titleSuggestions.map((item) => `+ ${item}`)}
              onSelect={(value) =>
                onFieldChange('title', value.replace(/^\+\s/, ''))
              }
            />
          </div>
        ) : null}

        {step === 3 ? (
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
                      {formState.title ||
                        t('expense.quickAdd.step2.notePlaceholder')}
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
        ) : null}
      </div>

      <DrawerFooter className='border-t border-border/70 px-2 pt-4 pb-safe'>
        <div className='flex items-center gap-3'>
          {step > 1 ? (
            <Button
              className='flex-1'
              type='button'
              variant='outline'
              onClick={() => onStepChange((step - 1) as AddExpenseStep)}>
              {t('common.actions.back')}
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              className='flex-1'
              disabled={
                step === 1
                  ? !canAdvanceAddExpenseCategoryStep(formState)
                  : !canAdvanceAddExpenseInfoStep(formState)
              }
              type='button'
              onClick={() => onStepChange((step + 1) as AddExpenseStep)}>
              {t('common.actions.continue')}
            </Button>
          ) : (
            <Button
              className='flex-1'
              disabled={isSubmitting}
              type='button'
              onClick={onSubmit}>
              {isSubmitting
                ? t('expense.submitting')
                : t('common.actions.finish')}
            </Button>
          )}
        </div>
      </DrawerFooter>
    </DrawerContent>
  )
}
