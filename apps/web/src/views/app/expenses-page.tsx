'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { ExpenseFeedList } from '@/components/expense/expense-feed-list'
import { ExpenseFeedSummary } from '@/components/expense/expense-feed-summary'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ExpenseListParams } from '@/types/expense'

function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [visibility, setVisibility] =
    useState<ExpenseListParams['visibility']>('household')
  const [categoryKey, setCategoryKey] =
    useState<ExpenseListParams['category_key']>('')

  const { data: referenceCategories } = useReferenceCategoriesQuery()

  const filters = useMemo<ExpenseListParams>(
    () => ({
      visibility,
      category_key: categoryKey || undefined,
    }),
    [categoryKey, visibility],
  )

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('expense.feed.title')}
          </h1>
        </div>
        <Button asChild>
          <Link href={PATHS.ADD_EXPENSE}>{t('expense.addTitle')}</Link>
        </Button>
      </header>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <input
          aria-label='expense feed search'
          className='h-8 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
          placeholder={t('expense.feed.title')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <NativeSelect
          aria-label='expense feed visibility'
          size='sm'
          value={visibility ?? ''}
          onChange={(event) =>
            setVisibility(
              event.target.value === ''
                ? undefined
                : (event.target.value as ExpenseListParams['visibility']),
            )
          }>
          <NativeSelectOption value=''>All</NativeSelectOption>
          <NativeSelectOption value='household'>Household</NativeSelectOption>
          <NativeSelectOption value='private'>Private</NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          aria-label='expense feed category'
          size='sm'
          value={categoryKey}
          onChange={(event) => setCategoryKey(event.target.value)}>
          <NativeSelectOption value=''>All categories</NativeSelectOption>
          {(referenceCategories?.items ?? [])
            .filter((category) => category.kind === 'expense')
            .map((category) => (
              <NativeSelectOption key={category.key} value={category.key}>
                {getCategoryLabel(category.key)}
              </NativeSelectOption>
            ))}
        </NativeSelect>
      </div>

      <ExpenseFeedSummary filters={filters} search={search} />

      <ExpenseFeedList filters={filters} search={search} />
    </div>
  )
}

export { ExpensesPage }
