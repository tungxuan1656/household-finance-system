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
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Input
          aria-label='expense feed search'
          placeholder={t('expense.feed.filters.searchPlaceholder')}
          value={values.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
        <NativeSelect
          aria-label='expense feed visibility'
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
          value={values.sort}
          onChange={(event) => onChange('sort', event.target.value)}>
          <NativeSelectOption value=''>
            {t('expense.feed.filters.sortLatest')}
          </NativeSelectOption>
          <NativeSelectOption value='occurred_at_desc'>
            {t('expense.feed.filters.sortLatest')}
          </NativeSelectOption>
          <NativeSelectOption value='amount_desc'>
            {t('expense.feed.filters.sortHighestAmount')}
          </NativeSelectOption>
        </NativeSelect>
      </div>

      <div className='rounded-lg border border-border bg-card'>
        <div className='flex flex-col gap-1 border-b border-border px-4 py-3'>
          <h2 className='text-sm font-medium'>
            {t('expense.feed.filters.advancedTitle')}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t('expense.feed.filters.advancedDescription')}
          </p>
        </div>
        <div className='px-4 py-4'>
          <FieldGroup>
            <FieldGroup className='grid gap-4 lg:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='expense-feed-date-from'>
                  {t('expense.feed.filters.dateFrom')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    aria-label='expense feed date from'
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
                    aria-label='expense feed date to'
                    id='expense-feed-date-to'
                    type='date'
                    value={values.dateTo}
                    onChange={(event) => onChange('dateTo', event.target.value)}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
            <FieldGroup className='grid gap-4 lg:grid-cols-3'>
              <Field>
                <FieldLabel htmlFor='expense-feed-amount-min'>
                  {t('expense.feed.filters.amountMin')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    aria-label='expense feed amount min'
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
                    aria-label='expense feed amount max'
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
                    aria-label='expense feed group'
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
      </div>
    </div>
  )
}

export type { ExpenseFeedFilterValues }
