import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { QueryState } from '@/components/shared/query-state'
import {
  TmaCategoryIconBadge,
  TmaPageHeader,
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

  const categoryHint = t('expenses.add.categoryHint', {
    defaultValue: '',
  })

  return (
    <TmaPageShell contentClassName='gap-4' title={t('expenses.add.title')}>
      <TmaPageHeader
        eyebrow={t('expenses.add.step', { current: '1', total: '3' })}
        subtitle={categoryHint || undefined}
        title={t('expenses.add.sectionCategory')}
      />

      <Card size='sm'>
        <CardContent className='pt-5'>
          <FieldGroup className='gap-4'>
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

      <Card size='sm'>
        <CardHeader>
          <CardTitle>{t('expenses.add.sectionCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryState
            empty={{
              description: t('expenses.add.emptyDesc'),
              title: t('expenses.add.emptyTitle'),
            }}
            error={{
              description: t('expenses.add.loadErrorDesc'),
              title: t('expenses.add.loadError'),
            }}
            isEmpty={(data) =>
              (data?.items ?? []).filter((c) => c.kind === 'expense').length ===
              0
            }
            pending={{
              description: t('expenses.add.loadingCategory'),
              title: t('expenses.add.loadingCategory'),
            }}
            query={categoriesQuery}
            variant='plain'>
            {(data) => {
              const categoryOptions = (data.items ?? [])
                .filter((category) => category.kind === 'expense')
                .map((category) => ({
                  id: category.key,
                  ...getCategoryPresentation(category.key, t, data.items ?? []),
                }))

              return (
                <div className='grid grid-cols-3 gap-2.5'>
                  {categoryOptions.map((category) => (
                    <Button
                      key={category.id}
                      className='flex min-h-24 flex-col items-center justify-start gap-2 p-3 text-center'
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
                      <span className='line-clamp-2 text-xs leading-tight font-semibold'>
                        {category.label}
                      </span>
                    </Button>
                  ))}
                </div>
              )
            }}
          </QueryState>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
