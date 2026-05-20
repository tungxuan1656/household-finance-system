'use client'

import {
  CalendarIcon,
  DollarSign,
  GroupIcon,
  HomeIcon,
  LayoutDashboardIcon,
  Pencil,
  WalletIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import {
  FIELD_ROW_INPUT_CLASS,
  FIELD_ROW_SELECT_CLASS,
  FieldRow,
} from '@/components/shared/form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { cn } from '@/utils/cn'

import { CategoryPicker } from './category-picker'
import type {
  ExpenseEntryCategoryOption,
  ExpenseEntryHouseholdOption,
} from './expense-entry-options'
import { SourcePicker } from './source-picker'
import type {
  ExpenseEntryFormErrors,
  ExpenseEntryFormState,
} from './use-expense-entry-form'

// Amount field uses a borderless underline style — different from the standard FieldRow.
type AmountFieldRowProps = {
  label: string
  icon?: ReactNode
  htmlFor: string
  children: ReactNode
}

const AmountFieldRow = ({
  label,
  icon,
  htmlFor,
  children,
}: AmountFieldRowProps) => (
  <Field className='flex-row items-center gap-2 border-none px-0 pl-2'>
    <div className='flex w-28! shrink-0 flex-row items-center gap-2'>
      {icon}
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
    </div>
    <div className='flex w-auto flex-1 flex-row justify-end'>{children}</div>
  </Field>
)

export type ExpenseEntryFormProps = {
  formId: string
  formState: ExpenseEntryFormState
  setField: <K extends keyof ExpenseEntryFormState>(
    key: K,
    value: ExpenseEntryFormState[K],
  ) => void
  errors: ExpenseEntryFormErrors
  isSubmitting: boolean
  amountDisplay: string
  categories: ExpenseEntryCategoryOption[]
  households: ExpenseEntryHouseholdOption[]
  groups: ExpenseGroupDTO[]
  titlePlaceholder: string
  onSubmit: () => void
}

export const ExpenseEntryForm = ({
  formId,
  formState,
  setField,
  errors,
  isSubmitting,
  amountDisplay,
  categories,
  households,
  groups,
  titlePlaceholder,
  onSubmit,
}: ExpenseEntryFormProps) => {
  return (
    <form
      className='flex min-h-0 flex-1 flex-col'
      id={formId}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}>
      <div className='min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-4'>
        <FieldGroup className='flex flex-col gap-3'>
          {/* Amount uses a special underline style, not the standard FieldRow border. */}
          <AmountFieldRow
            htmlFor='expense-amount'
            icon={<DollarSign className='size-4' />}
            label={t('expense.amount')}>
            <InputGroup className='rounded-none border-0 border-b-2 border-border bg-transparent ring-0!'>
              <InputGroupInput
                aria-invalid={!!errors.amountInput}
                className='h-auto! px-0! text-right font-mono text-2xl! tabular-nums'
                disabled={isSubmitting}
                id='expense-amount'
                inputMode='numeric'
                placeholder='0'
                type='text'
                value={amountDisplay}
                onChange={(event) =>
                  setField('amountInput', event.target.value)
                }
              />
              <InputGroupAddon align='inline-end'>
                <InputGroupText className='font-mono text-2xl! tabular-nums'>
                  .000 đ
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.amountInput}</FieldError>
          </AmountFieldRow>

          <FieldRow
            htmlFor='expense-title'
            icon={<Pencil className='size-4' />}
            label={t('expense.content')}>
            <Input
              aria-invalid={!!errors.title}
              className={cn(FIELD_ROW_INPUT_CLASS)}
              disabled={isSubmitting}
              id='expense-title'
              placeholder={titlePlaceholder}
              size='sm'
              value={formState.title}
              onChange={(event) => setField('title', event.target.value)}
            />
            <FieldError>{errors.title}</FieldError>
          </FieldRow>

          <FieldRow
            htmlFor='expense-date'
            icon={<CalendarIcon className='size-4' />}
            label={t('expense.date')}>
            <Input
              aria-invalid={!!errors.occurredOn}
              className={cn(FIELD_ROW_INPUT_CLASS, 'w-auto')}
              disabled={isSubmitting}
              id='expense-date'
              size='sm'
              type='date'
              value={formState.occurredOn}
              onChange={(event) => setField('occurredOn', event.target.value)}
            />
            <FieldError>{errors.occurredOn}</FieldError>
          </FieldRow>

          <FieldRow
            htmlFor='expense-category'
            icon={<LayoutDashboardIcon className='size-4' />}
            label={t('expense.category')}>
            <CategoryPicker
              categories={categories}
              disabled={isSubmitting}
              id='expense-category'
              size='sm'
              value={formState.categoryKey}
              onValueChange={(value) => setField('categoryKey', value)}
            />
            <FieldError>{errors.categoryKey}</FieldError>
          </FieldRow>

          <FieldRow
            htmlFor='expense-source'
            icon={<WalletIcon className='size-4' />}
            label={t('expense.source')}>
            <SourcePicker
              disabled={isSubmitting}
              id='expense-source'
              size='sm'
              value={formState.sourceKey || undefined}
              onValueChange={(value) => setField('sourceKey', value)}
            />
            <FieldError>{errors.sourceKey}</FieldError>
          </FieldRow>

          <FieldRow
            htmlFor='expense-household'
            icon={<HomeIcon className='size-4' />}
            label={t('expense.household')}>
            <NativeSelect
              className='w-full'
              disabled={isSubmitting}
              id='expense-household'
              labelClassName={FIELD_ROW_SELECT_CLASS}
              size='sm'
              value={formState.householdId}
              onChange={(event) => setField('householdId', event.target.value)}>
              <NativeSelectOption value=''>
                {t('expense.none')}
              </NativeSelectOption>
              {households.map((household) => (
                <NativeSelectOption key={household.id} value={household.id}>
                  {household.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FieldRow>

          <FieldRow
            htmlFor='expense-group'
            icon={<GroupIcon className='size-4' />}
            label={t('expense.group')}>
            <NativeSelect
              className='w-full'
              disabled={isSubmitting}
              id='expense-group'
              labelClassName={FIELD_ROW_SELECT_CLASS}
              size='sm'
              value={formState.groupId}
              onChange={(event) => setField('groupId', event.target.value)}>
              <NativeSelectOption value=''>
                {t('expense.none')}
              </NativeSelectOption>
              {groups.map((group) => (
                <NativeSelectOption key={group.id} value={group.id}>
                  {group.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FieldRow>
        </FieldGroup>
      </div>
    </form>
  )
}
