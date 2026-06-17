import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { ChipButton, DataState, Section, SectionHeader } from '@/components/ui'
import { useEditExpenseStore } from '@/features/expenses/store'
import { useReferenceCategoriesQuery } from '@/features/home/api'
import { getCategoryPresentation } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const ExpenseEditCategoryPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const categoriesQuery = useReferenceCategoriesQuery()
  const referenceCategories = categoriesQuery.data?.items ?? []
  const draft = useEditExpenseStore((state) => state.draft)
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  const categoryOptions = referenceCategories
    .filter((category) => category.kind === 'expense')
    .map((category) => ({
      id: category.key,
      ...getCategoryPresentation(category.key, t, referenceCategories),
    }))

  useEffect(() => {
    if (!draft) navigate(TMA_PATHS.expenses)
  }, [draft, navigate])

  if (!draft) return null

  return (
    <TmaPageShell title={t('expenses.edit.categoryPicker')}>
      <Section>
        <SectionHeader title={t('expenses.edit.sectionCategory')} />
        <DataState
          emptyDescription={t('expenses.edit.emptyDescription')}
          emptyTitle={t('expenses.edit.emptyTitle')}
          errorDescription={t('expenses.edit.loadErrorDesc')}
          errorTitle={t('expenses.edit.loadError')}
          isEmpty={
            !categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            categoryOptions.length === 0
          }
          isError={categoriesQuery.isError && categoryOptions.length === 0}
          isLoading={categoriesQuery.isLoading && categoryOptions.length === 0}
          loadingDescription={t('expenses.edit.loadErrorDesc')}
          loadingTitle={t('expenses.edit.loadingCategory')}
          retryAction={categoriesQuery.refetch}>
          <div className='grid grid-cols-3 gap-2'>
            {categoryOptions.map((category) => {
              const isActive = draft.categoryKey === category.id

              return (
                <ChipButton
                  key={category.id}
                  aria-pressed={isActive}
                  className={cn(
                    'grid min-h-20 content-start',
                    isActive && 'ring-2 ring-tma-primary',
                  )}
                  onClick={() => {
                    selection()
                    updateDraft({ categoryKey: category.id })
                    navigate(-1)
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
              )
            })}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
