import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
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
    <TmaPageShell
      contentClassName='gap-4'
      title={t('expenses.edit.categoryPicker')}>
      <Card size='sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm tracking-normal normal-case'>
            {t('expenses.edit.sectionCategory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryState
            empty={{
              description: t('expenses.edit.emptyDescription'),
              title: t('expenses.edit.emptyTitle'),
            }}
            error={{
              description: t('expenses.edit.loadErrorDesc'),
              title: t('expenses.edit.loadError'),
            }}
            isEmpty={categoryOptions.length === 0}
            pending={{
              description: '',
              title: t('expenses.edit.loadingCategory'),
            }}
            query={categoriesQuery}
            variant='plain'>
            {() => (
              <div className='grid grid-cols-3 gap-2.5 sm:grid-cols-4'>
                {categoryOptions.map((category) => {
                  const isActive = draft.categoryKey === category.id

                  return (
                    <Button
                      key={category.id}
                      aria-pressed={isActive}
                      className={cn(
                        'grid min-h-20 content-start gap-1 p-2.5 text-center',
                        isActive &&
                          'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-card',
                      )}
                      data-state={isActive ? 'on' : 'off'}
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
                      <span className='line-clamp-2 text-center text-xs leading-tight font-semibold text-balance wrap-break-word'>
                        {category.label}
                      </span>
                    </Button>
                  )
                })}
              </div>
            )}
          </QueryState>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
