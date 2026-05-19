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

import { t } from '@/lib/i18n/t'
import type { ExpenseGroupDTO } from '@/types/group'
import type { CategoryKey } from '@/types/reference-data'
import { cn } from '@/utils/cn'

import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../ui/input-group'
import { NativeSelect, NativeSelectOption } from '../ui/native-select'
import { CategoryPicker } from './category-picker'
import { SourcePicker } from './source-picker'
import type {
  AddExpenseFormErrors,
  AddExpenseFormState,
} from './use-add-expense-form'

export type AddExpenseCategoryOption = {
  key: CategoryKey
  kind: 'expense'
  iconUrl: string
  color: string
}

export type AddExpenseHouseholdOption = {
  id: string
  name: string
}

type AddExpenseFormProps = {
  formState: AddExpenseFormState
  setField: <K extends keyof AddExpenseFormState>(
    key: K,
    value: AddExpenseFormState[K],
  ) => void
  errors: AddExpenseFormErrors
  isSubmitting: boolean
  amountDisplay: string
  categories: AddExpenseCategoryOption[]
  households: AddExpenseHouseholdOption[]
  groups: ExpenseGroupDTO[]
  titlePlaceholder: string
  onSubmit: () => void
}

type FieldRowProps = {
  label: string
  icon?: ReactNode
  htmlFor: string
  children: ReactNode
  className?: string
}

const FieldRow = ({
  label,
  icon,
  htmlFor,
  children,
  className,
}: FieldRowProps) => {
  return (
    <Field
      className={cn(
        `flex-row items-center gap-2 rounded-2xl border border-border px-3 py-1`,
        className,
      )}>
      <div className='flex w-28! flex-row items-center gap-2'>
        {icon}
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      </div>
      <div className='flex w-auto flex-1 flex-row justify-end'>{children}</div>
    </Field>
  )
}

export const AddExpenseForm = ({
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
}: AddExpenseFormProps) => {
  return (
    <form
      className='flex min-h-0 flex-1 flex-col'
      id='add-expense-form'
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}>
      <div className='min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-4'>
        <FieldGroup className='flex flex-col gap-3'>
          <FieldRow
            className='border-none px-0 pl-2'
            htmlFor='add-expense-amount'
            icon={<DollarSign className='size-4' />}
            label={t('expense.amount')}>
            <InputGroup className='rounded-none border-0 border-b-2 border-border bg-transparent ring-0!'>
              <InputGroupInput
                aria-invalid={!!errors.amountInput}
                className='h-auto! px-0! text-right font-mono text-2xl! tabular-nums'
                disabled={isSubmitting}
                id='add-expense-amount'
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
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-title'
            icon={<Pencil className='size-4' />}
            label={t('expense.content')}>
            <Input
              aria-invalid={!!errors.title}
              className='border-none bg-transparent text-right ring-0!'
              disabled={isSubmitting}
              id='add-expense-title'
              placeholder={titlePlaceholder}
              size='sm'
              value={formState.title}
              onChange={(event) => setField('title', event.target.value)}
            />
            <FieldError>{errors.title}</FieldError>
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-date'
            icon={<CalendarIcon className='size-4' />}
            label={t('expense.date')}>
            <Input
              aria-invalid={!!errors.occurredOn}
              className='w-auto border-none bg-transparent text-right ring-0!'
              disabled={isSubmitting}
              id='add-expense-date'
              size='sm'
              type='date'
              value={formState.occurredOn}
              onChange={(event) => setField('occurredOn', event.target.value)}
            />
            <FieldError>{errors.occurredOn}</FieldError>
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-category'
            icon={<LayoutDashboardIcon className='size-4' />}
            label={t('expense.category')}>
            <CategoryPicker
              categories={categories}
              disabled={isSubmitting}
              id='add-expense-category'
              size='sm'
              value={formState.categoryKey}
              onValueChange={(value) => setField('categoryKey', value)}
            />
            <FieldError>{errors.categoryKey}</FieldError>
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-source'
            icon={<WalletIcon className='size-4' />}
            label={t('expense.source')}>
            <SourcePicker
              disabled={isSubmitting}
              id='add-expense-source'
              size='sm'
              value={formState.sourceKey || undefined}
              onValueChange={(value) => setField('sourceKey', value)}
            />
            <FieldError>{errors.sourceKey}</FieldError>
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-household'
            icon={<HomeIcon className='size-4' />}
            label={t('expense.household')}>
            <NativeSelect
              className='w-full'
              disabled={isSubmitting}
              id='add-expense-household'
              labelClassName='border-none bg-transparent text-sm text-right ring-0!'
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
            htmlFor='add-expense-group'
            icon={<GroupIcon className='size-4' />}
            label={t('expense.group')}>
            <NativeSelect
              className='w-full'
              disabled={isSubmitting}
              id='add-expense-group'
              labelClassName='border-none bg-transparent text-sm text-right! ring-0!'
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
