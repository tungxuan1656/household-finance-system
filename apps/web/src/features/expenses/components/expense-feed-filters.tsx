'use client'

import {
  ArrowDownUpIcon,
  CalendarIcon,
  DollarSign,
  EyeIcon,
  FilterIcon,
  GroupIcon,
  LayoutDashboardIcon,
  SearchIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import type { ExpenseListParams } from '../types/expense'

type ExpenseFeedFilterValues = {
  amountMax: string
  amountMin: string
  categoryKey: string
  dateFrom: string
  dateTo: string
  groupId: string
  search: string
  sort: NonNullable<ExpenseListParams['sort']> | ''
  visibility: ExpenseListParams['visibility'] | ''
}

type ExpenseFeedFiltersProps = {
  categories: ReferenceCategoryDTO[]
  groups: ExpenseGroupDTO[]
  values: ExpenseFeedFilterValues
  onChange: (key: keyof ExpenseFeedFilterValues, value: string) => void
}

const formatAmountInput = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  return new Intl.NumberFormat('vi-VN').format(Number(digits))
}

const ROW_BASE_CLASS_NAME =
  'flex-row items-center gap-2 rounded-2xl border border-border px-3 py-1'
const ROW_LABEL_CLASS_NAME =
  'flex w-28! shrink-0 flex-row items-center gap-2 sm:w-32!'
const ROW_CONTROL_CLASS_NAME = 'flex min-w-0 flex-1 w-auto flex-row justify-end'
const NATIVE_SELECT_LABEL_CLASS_NAME =
  'border-none bg-transparent text-sm text-right ring-0!'
const INPUT_CLASS_NAME = 'w-full border-none bg-transparent text-right ring-0!'

type FieldRowProps = {
  label: string
  icon?: ReactNode
  htmlFor: string
  children: ReactNode
}

const FieldRow = ({ label, icon, htmlFor, children }: FieldRowProps) => (
  <Field className={ROW_BASE_CLASS_NAME}>
    <div className={ROW_LABEL_CLASS_NAME}>
      {icon}
      <FieldLabel className='font-normal' htmlFor={htmlFor}>
        {label}
      </FieldLabel>
    </div>
    <div className={ROW_CONTROL_CLASS_NAME}>{children}</div>
  </Field>
)

export function ExpenseFeedFilters({
  categories,
  groups,
  values,
  onChange,
}: ExpenseFeedFiltersProps) {
  return (
    <div className='flex items-center gap-3'>
      <div className='relative flex-1'>
        <SearchIcon className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          aria-label='expense feed search'
          className='h-10 pl-9'
          placeholder={t('expense.feed.filters.searchPlaceholder')}
          type='search'
          value={values.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className='h-10 shrink-0 px-3 sm:px-4' variant='outline'>
            <FilterIcon className='size-4 sm:mr-2' />
            <span className='hidden sm:inline'>
              {t('expense.feed.filters.advancedTitle')}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className='grid max-h-[85vh] grid-rows-[auto_1fr] gap-0 overflow-hidden p-0 sm:max-w-md'>
          <DialogHeader className='px-5 pt-5 pb-3'>
            <DialogTitle>{t('expense.feed.filters.advancedTitle')}</DialogTitle>
          </DialogHeader>

          <div className='min-h-0 overflow-y-auto px-5 pb-5'>
            <FieldGroup className='flex flex-col gap-3'>
              <FieldRow
                htmlFor='expense-feed-sort'
                icon={<ArrowDownUpIcon className='size-4' />}
                label={t('expense.feed.filters.sortLatest')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-sort'
                  labelClassName={NATIVE_SELECT_LABEL_CLASS_NAME}
                  size='sm'
                  value={values.sort}
                  onChange={(event) => onChange('sort', event.target.value)}>
                  <NativeSelectOption value='occurred_at_desc'>
                    {t('expense.feed.filters.sortLatest')}
                  </NativeSelectOption>
                  <NativeSelectOption value='amount_desc'>
                    {t('expense.feed.filters.sortHighestAmount')}
                  </NativeSelectOption>
                </NativeSelect>
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-visibility'
                icon={<EyeIcon className='size-4' />}
                label={t('expense.visibility.household')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-visibility'
                  labelClassName={NATIVE_SELECT_LABEL_CLASS_NAME}
                  size='sm'
                  value={values.visibility}
                  onChange={(event) =>
                    onChange('visibility', event.target.value)
                  }>
                  <NativeSelectOption value=''>
                    {t('expense.feed.filters.allVisibility')}
                  </NativeSelectOption>
                  <NativeSelectOption value='household'>
                    {t('expense.visibility.household')}
                  </NativeSelectOption>
                  <NativeSelectOption value='private'>
                    {t('expense.visibility.private')}
                  </NativeSelectOption>
                </NativeSelect>
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-category'
                icon={<LayoutDashboardIcon className='size-4' />}
                label={t('expense.feed.filters.category')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-category'
                  labelClassName={NATIVE_SELECT_LABEL_CLASS_NAME}
                  size='sm'
                  value={values.categoryKey}
                  onChange={(event) =>
                    onChange('categoryKey', event.target.value)
                  }>
                  <NativeSelectOption value=''>
                    {t('expense.feed.filters.allCategories')}
                  </NativeSelectOption>
                  {categories.map((category) => (
                    <NativeSelectOption key={category.key} value={category.key}>
                      {getCategoryLabel(category.key)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-date-from'
                icon={<CalendarIcon className='size-4' />}
                label={t('expense.feed.filters.dateFrom')}>
                <div>
                  <Input
                    className={INPUT_CLASS_NAME}
                    id='expense-feed-date-from'
                    size='sm'
                    type='date'
                    value={values.dateFrom}
                    onChange={(event) =>
                      onChange('dateFrom', event.target.value)
                    }
                  />
                </div>
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-date-to'
                icon={<CalendarIcon className='size-4' />}
                label={t('expense.feed.filters.dateTo')}>
                <div>
                  <Input
                    className={INPUT_CLASS_NAME}
                    id='expense-feed-date-to'
                    size='sm'
                    type='date'
                    value={values.dateTo}
                    onChange={(event) => onChange('dateTo', event.target.value)}
                  />
                </div>
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-amount-min'
                icon={<DollarSign className='size-4' />}
                label={t('expense.feed.filters.amountMin')}>
                <Input
                  className={INPUT_CLASS_NAME}
                  id='expense-feed-amount-min'
                  inputMode='numeric'
                  placeholder='0'
                  size='sm'
                  type='text'
                  value={values.amountMin}
                  onChange={(event) => {
                    const formatted = formatAmountInput(event.target.value)
                    onChange('amountMin', formatted)
                  }}
                />
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-amount-max'
                icon={<DollarSign className='size-4' />}
                label={t('expense.feed.filters.amountMax')}>
                <Input
                  className={INPUT_CLASS_NAME}
                  id='expense-feed-amount-max'
                  inputMode='numeric'
                  placeholder='0'
                  size='sm'
                  type='text'
                  value={values.amountMax}
                  onChange={(event) => {
                    const formatted = formatAmountInput(event.target.value)
                    onChange('amountMax', formatted)
                  }}
                />
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-group'
                icon={<GroupIcon className='size-4' />}
                label={t('expense.groupPicker.label')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-group'
                  labelClassName={NATIVE_SELECT_LABEL_CLASS_NAME}
                  size='sm'
                  value={values.groupId}
                  onChange={(event) => onChange('groupId', event.target.value)}>
                  <NativeSelectOption value=''>
                    {t('expense.feed.filters.allGroups')}
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

export type { ExpenseFeedFilterValues }
