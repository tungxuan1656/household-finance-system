'use client'

import { DataState } from '@/components/shared/data-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import type { AnalyticsTopCategoryDTO } from '@/types/analytics'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { formatCurrency } from '@/utils/currency/format'

type CategoryItem = AnalyticsTopCategoryDTO

type CategoryBreakdownProps = {
  categories: CategoryItem[]
  currencyCode: string
  isLoading: boolean
  isEmpty: boolean
  isError?: boolean
  referenceCategories?: ReferenceCategoryDTO[]
}

function CategoryBreakdown({
  categories,
  currencyCode,
  isLoading,
  isEmpty,
  isError,
  referenceCategories,
}: CategoryBreakdownProps) {
  return (
    <DataState
      emptyDescription={t('app.overview.categoryBreakdown.empty')}
      isEmpty={isEmpty}
      isError={isError}
      isLoading={isLoading}
      title={t('app.overview.categoryBreakdown.title')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('app.overview.categoryBreakdown.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-3'>
            {categories.map((cat) => {
              const presentation = getCategoryPresentation(
                cat.categoryKey,
                referenceCategories,
              )

              return (
                <div key={cat.categoryKey} className='flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      {presentation.label}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-sm text-muted-foreground tabular-nums'>
                        {cat.percentOfTotal}%
                      </span>
                      <span className='font-mono text-sm tabular-nums'>
                        {formatCurrency(cat.totalSpendMinor, currencyCode)}
                      </span>
                    </div>
                  </div>
                  <Progress value={cat.percentOfTotal} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </DataState>
  )
}

export type { CategoryBreakdownProps, CategoryItem }
export { CategoryBreakdown }
