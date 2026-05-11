'use client'

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ExpenseListParams } from '@/types/expense'
import type { ExpenseGroupDTO } from '@/types/group'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

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

export function ExpenseFeedFilters({
  categories,
  groups,
  values,
  onChange,
}: ExpenseFeedFiltersProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <Input
          aria-label='expense feed search'
          className='h-12 md:h-10'
          placeholder={t('expense.feed.filters.searchPlaceholder')}
          type='search'
          value={values.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
        <NativeSelect
          aria-label='expense feed visibility'
          className='w-full'
          value={values.visibility}
          onChange={(event) => onChange('visibility', event.target.value)}>
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
        <NativeSelect
          aria-label='expense feed category'
          className='w-full'
          value={values.categoryKey}
          onChange={(event) => onChange('categoryKey', event.target.value)}>
          <NativeSelectOption value=''>
            {t('expense.feed.filters.allCategories')}
          </NativeSelectOption>
          {categories.map((category) => (
            <NativeSelectOption key={category.key} value={category.key}>
              {getCategoryLabel(category.key)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label='expense feed sort'
          className='w-full'
          value={values.sort}
          onChange={(event) => onChange('sort', event.target.value)}>
          <NativeSelectOption value='occurred_at_desc'>
            {t('expense.feed.filters.sortLatest')}
          </NativeSelectOption>
          <NativeSelectOption value='amount_desc'>
            {t('expense.feed.filters.sortHighestAmount')}
          </NativeSelectOption>
        </NativeSelect>
      </div>

      <details className='rounded-lg border border-border bg-card'>
        <summary className='cursor-pointer list-none px-4 py-3 marker:hidden'>
          <span className='flex flex-col gap-1'>
            <span className='text-sm font-medium'>
              {t('expense.feed.filters.advancedTitle')}
            </span>
            <span className='text-sm text-muted-foreground'>
              {t('expense.feed.filters.advancedDescription')}
            </span>
          </span>
        </summary>
        <div className='border-t border-border px-4 py-4'>
          <FieldGroup>
            <FieldGroup className='grid gap-4 md:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='expense-feed-date-from'>
                  {t('expense.feed.filters.dateFrom')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    className='h-12 md:h-10'
                    id='expense-feed-date-from'
                    type='date'
                    value={values.dateFrom}
                    onChange={(event) =>
                      onChange('dateFrom', event.target.value)
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor='expense-feed-date-to'>
                  {t('expense.feed.filters.dateTo')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    className='h-12 md:h-10'
                    id='expense-feed-date-to'
                    type='date'
                    value={values.dateTo}
                    onChange={(event) => onChange('dateTo', event.target.value)}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
            <FieldGroup className='grid gap-4 md:grid-cols-3'>
              <Field>
                <FieldLabel htmlFor='expense-feed-amount-min'>
                  {t('expense.feed.filters.amountMin')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    className='h-12 md:h-10'
                    id='expense-feed-amount-min'
                    inputMode='numeric'
                    type='number'
                    value={values.amountMin}
                    onChange={(event) =>
                      onChange('amountMin', event.target.value)
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor='expense-feed-amount-max'>
                  {t('expense.feed.filters.amountMax')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    className='h-12 md:h-10'
                    id='expense-feed-amount-max'
                    inputMode='numeric'
                    type='number'
                    value={values.amountMax}
                    onChange={(event) =>
                      onChange('amountMax', event.target.value)
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor='expense-feed-group'>
                  {t('expense.groupPicker.label')}
                </FieldLabel>
                <FieldContent>
                  <NativeSelect
                    className='w-full'
                    id='expense-feed-group'
                    value={values.groupId}
                    onChange={(event) =>
                      onChange('groupId', event.target.value)
                    }>
                    <NativeSelectOption value=''>
                      {t('expense.feed.filters.allGroups')}
                    </NativeSelectOption>
                    {groups.map((group) => (
                      <NativeSelectOption key={group.id} value={group.id}>
                        {group.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </div>
      </details>
    </div>
  )
}

export type { ExpenseFeedFilterValues }
