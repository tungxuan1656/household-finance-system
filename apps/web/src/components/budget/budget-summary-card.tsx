'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import type { BudgetDTO } from '@/types/budget'
import { formatCurrency } from '@/utils/currency/format'

type BudgetSummaryCardProps = {
  budget: BudgetDTO
}

function BudgetSummaryCard({ budget }: BudgetSummaryCardProps) {
  const { data: categoriesData } = useReferenceCategoriesQuery()
  const categories = categoriesData?.items ?? []
  const categoryMap = new Map<string, (typeof categories)[number]>(
    categories.map((cat) => [cat.key, cat]),
  )

  const totalCategoryLimits = budget.categoryLimits.reduce(
    (sum, cl) => sum + cl.limitMinor,
    0,
  )
  const unallocated = budget.totalLimitMinor - totalCategoryLimits

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base md:text-lg'>
          {t('budgets.summary.title')}
        </CardTitle>
        <CardDescription>
          {t('budgets.summary.period')}: {budget.period}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5'>
          <span className='text-sm font-medium'>
            {t('budgets.summary.totalBudget')}
          </span>
          <span className='text-sm font-semibold'>
            {formatCurrency(budget.totalLimitMinor, budget.currencyCode)}
          </span>
        </div>

        {budget.categoryLimits.length > 0 && (
          <div className='flex flex-col gap-3'>
            <p className='text-sm font-medium'>
              {t('budgets.summary.categoryBreakdown')}
            </p>
            <div className='flex flex-col gap-2'>
              {budget.categoryLimits.map((cl) => {
                const category = categoryMap.get(cl.categoryKey)
                const percent = Math.round(
                  (cl.limitMinor / budget.totalLimitMinor) * 100,
                )

                return (
                  <div
                    key={cl.categoryKey}
                    className='flex items-center justify-between gap-2 text-sm'>
                    <div className='flex min-w-0 items-center gap-2'>
                      {category && (
                        <span
                          className='inline-block h-2.5 w-2.5 shrink-0 rounded-full'
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className='truncate'>{cl.categoryKey}</span>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <span className='text-xs text-muted-foreground'>
                        {percent}%
                      </span>
                      <span className='text-muted-foreground tabular-nums'>
                        {formatCurrency(cl.limitMinor, budget.currencyCode)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {unallocated > 0 && (
          <div className='flex items-center justify-between rounded-lg border border-dashed px-3 py-2 text-sm'>
            <span className='text-muted-foreground'>
              {t('budgets.summary.unallocated')}
            </span>
            <span className='font-medium text-muted-foreground'>
              {formatCurrency(unallocated, budget.currencyCode)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { BudgetSummaryCard }
