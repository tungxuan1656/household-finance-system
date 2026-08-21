import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEditExpenseStore } from '@/features/expenses/model/store'
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
      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.edit.sectionCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
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
            isLoading={
              categoriesQuery.isLoading && categoryOptions.length === 0
            }
            loadingDescription={t('expenses.edit.loadErrorDesc')}
            loadingTitle={t('expenses.edit.loadingCategory')}
            retryAction={categoriesQuery.refetch}>
            <div className='grid grid-cols-3 gap-2'>
              {categoryOptions.map((category) => {
                const isActive = draft.categoryKey === category.id

                return (
                  <Button
                    key={category.id}
                    aria-pressed={isActive}
                    className={cn(
                      'grid min-h-20 content-start gap-1 text-left',
                      isActive && 'ring-2 ring-primary',
                    )}
                    type='button'
                    variant='outline'
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
                    <span className='text-xs font-semibold'>
                      {category.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </DataState>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
