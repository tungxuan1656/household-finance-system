import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { DatePicker } from '@/components/shared/date-picker'
import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useAddExpenseFlowStore } from '@/features/expenses/model/store'
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
      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.dateLabel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-expense-date'>
                {t('expenses.add.dateLabel')}
              </FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('expenses.add.dateLabel')}
                id='add-expense-date'
                value={date.slice(0, 10)}
                onChange={(value) => {
                  const nextDate = new Date(
                    `${value}T12:00:00+07:00`,
                  ).toISOString()
                  setDate(nextDate)
                }}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.sectionCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
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
            isLoading={
              categoriesQuery.isLoading && categoryOptions.length === 0
            }
            loadingDescription={t('expenses.add.loadingCategory')}
            loadingTitle={t('expenses.add.loadingCategory')}
            retryAction={categoriesQuery.refetch}>
            <div className='grid grid-cols-3 gap-2'>
              {categoryOptions.map((category) => (
                <Button
                  key={category.id}
                  className='grid min-h-20 content-start gap-1 text-left'
                  type='button'
                  variant='outline'
                  onClick={() => {
                    selection()
                    selectCategory(category)

                    navigate(TMA_PATHS.expensesNewDetails, {
                      flushSync: true,
                    })
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
              ))}
            </div>
          </DataState>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
