import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { DatePicker } from '@/components/shared/date-picker'
import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { Button } from '@/components/ui/button'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { useReferenceCategoriesQuery } from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import { selection } from '@/lib/telegram/haptics'

export const AddExpenseCategoryPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const date = useAddExpenseFlowStore((state) => state.date)
  const setDate = useAddExpenseFlowStore((state) => state.setDate)
  const selectCategory = useAddExpenseFlowStore((state) => state.selectCategory)
  const categoriesQuery = useReferenceCategoriesQuery()
  const referenceCategories = categoriesQuery.data?.items ?? []
  const categoryOptions = referenceCategories
    .filter((category) => category.kind === 'expense')
    .map((category) => ({
      id: category.key,
      ...getCategoryPresentation(category.key, t, referenceCategories),
    }))

  return (
    <TmaPageShell title={t('expenses.add.title')}>
      <DatePicker
        fullWidth
        aria-label={t('expenses.add.dateLabel')}
        className='mt-4'
        value={date.slice(0, 10)}
        onChange={(value) => {
          const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
          setDate(nextDate)
        }}
      />

      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.add.sectionCategory')}
        </h2>
        <DataState
          emptyDescription={t('expenses.add.emptyDesc')}
          emptyTitle={t('expenses.add.emptyTitle')}
          errorDescription={t('expenses.add.loadErrorDesc')}
          errorTitle={t('expenses.add.loadError')}
          isEmpty={
            !categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            categoryOptions.length === 0
          }
          isError={categoriesQuery.isError && categoryOptions.length === 0}
          isLoading={categoriesQuery.isLoading && categoryOptions.length === 0}
          loadingDescription={t('expenses.add.loadingCategory')}
          loadingTitle={t('expenses.add.loadingCategory')}
          retryAction={categoriesQuery.refetch}>
          <div className='grid grid-cols-3 gap-2'>
            {categoryOptions.map((category) => (
              <Button
                key={category.id}
                aria-pressed={false}
                className='grid min-h-20 content-start rounded-2xl border-transparent bg-card p-2.5 text-left shadow-sm'
                type='button'
                variant='outline'
                onClick={() => {
                  selection()
                  selectCategory(category)
                  navigate(TMA_PATHS.expensesNewDetails, { flushSync: true })
                }}>
                <TmaCategoryIconBadge
                  accent={category.accent}
                  iconUrl={category.iconUrl}
                  symbol={category.symbol}
                />
                <span className='text-xs font-semibold text-foreground'>
                  {category.label}
                </span>
              </Button>
            ))}
          </div>
        </DataState>
      </section>
    </TmaPageShell>
  )
}
