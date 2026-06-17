import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { ChipButton, DataState, Section, SectionHeader } from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
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
          selection()

          const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
          setDate(nextDate)
        }}
      />

      <Section>
        <SectionHeader title={t('expenses.add.sectionCategory')} />
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
              <ChipButton
                key={category.id}
                aria-pressed={false}
                className='grid min-h-20 content-start'
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
                <span className='text-xs font-semibold text-tma-text-strong'>
                  {category.label}
                </span>
              </ChipButton>
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
