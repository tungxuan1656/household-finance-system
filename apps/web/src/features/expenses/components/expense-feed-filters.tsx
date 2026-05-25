'use client'

import {
  ArrowDownUpIcon,
  CalendarIcon,
  DollarSign,
  FilterIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SearchIcon,
} from 'lucide-react'

import {
  FIELD_ROW_INPUT_CLASS,
  FIELD_ROW_SELECT_CLASS,
  FieldRow,
} from '@/components/shared/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import type { HouseholdDTO } from '@/features/households/types/household'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { formatAmountInput } from '@/utils/currency/format'

import type { ExpenseListParams } from '../types/expense'

export type ExpenseFeedFilterValues = {
  amountMax: string
  amountMin: string
  categoryKey: string
  dateFrom: string
  dateTo: string
  groupId: string
  search: string
  sort: NonNullable<ExpenseListParams['sort']> | ''
  householdId: string
}

type ExpenseFeedFiltersProps = {
  categories: ReferenceCategoryDTO[]
  groups: ExpenseGroupDTO[]
  households: HouseholdDTO[]
  values: ExpenseFeedFilterValues
  onChange: (key: keyof ExpenseFeedFilterValues, value: string) => void
}

export function ExpenseFeedFilters({
  categories,
  groups,
  households,
  values,
  onChange,
}: ExpenseFeedFiltersProps) {
  return (
    <div className='flex items-center gap-3'>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className='text-muted-foreground' />
        </InputGroupAddon>
        <InputGroupInput
          aria-label='expense feed search'
          className='text-sm'
          placeholder={t('expense.feed.filters.searchPlaceholder')}
          type='search'
          value={values.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
      </InputGroup>

      <Dialog>
        <DialogTrigger asChild>
          <Button className='h-10 shrink-0 px-3 sm:px-4' variant='outline'>
            <FilterIcon className='size-4 sm:mr-2' />
            <span className='hidden sm:inline'>
              {t('expense.feed.filters.advancedTitle')}
            </span>
          </Button>
        </DialogTrigger>

        {/* Title is pinned; inner div scrolls independently. */}
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
                  labelClassName={FIELD_ROW_SELECT_CLASS}
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
                htmlFor='expense-feed-household'
                icon={<HomeIcon className='size-4' />}
                label={t('expense.feed.filters.household')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-household'
                  labelClassName={FIELD_ROW_SELECT_CLASS}
                  size='sm'
                  value={values.householdId}
                  onChange={(event) =>
                    onChange('householdId', event.target.value)
                  }>
                  <NativeSelectOption value=''>
                    {t('expense.feed.filters.allHouseholds')}
                  </NativeSelectOption>
                  {households.map((household) => (
                    <NativeSelectOption key={household.id} value={household.id}>
                      {household.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-category'
                icon={<LayoutDashboardIcon className='size-4' />}
                label={t('expense.feed.filters.category')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-category'
                  labelClassName={FIELD_ROW_SELECT_CLASS}
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
                    className={FIELD_ROW_INPUT_CLASS}
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
                    className={FIELD_ROW_INPUT_CLASS}
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
                  className={FIELD_ROW_INPUT_CLASS}
                  id='expense-feed-amount-min'
                  inputMode='numeric'
                  placeholder='0'
                  size='sm'
                  type='text'
                  value={values.amountMin}
                  onChange={(event) =>
                    onChange('amountMin', formatAmountInput(event.target.value))
                  }
                />
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-amount-max'
                icon={<DollarSign className='size-4' />}
                label={t('expense.feed.filters.amountMax')}>
                <Input
                  className={FIELD_ROW_INPUT_CLASS}
                  id='expense-feed-amount-max'
                  inputMode='numeric'
                  placeholder='0'
                  size='sm'
                  type='text'
                  value={values.amountMax}
                  onChange={(event) =>
                    onChange('amountMax', formatAmountInput(event.target.value))
                  }
                />
              </FieldRow>

              <FieldRow
                htmlFor='expense-feed-group'
                icon={<FilterIcon className='size-4' />}
                label={t('expense.groupPicker.label')}>
                <NativeSelect
                  className='w-full'
                  id='expense-feed-group'
                  labelClassName={FIELD_ROW_SELECT_CLASS}
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
