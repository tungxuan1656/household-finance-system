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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

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
    <Card>
      <CardHeader>
        <CardTitle>{t('budgets.summary.title')}</CardTitle>
        <CardDescription>
          {t('budgets.summary.period')}: {budget.period}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>
            {t('budgets.summary.totalBudget')}
          </span>
          <span className='text-sm'>
            {formatCurrency(budget.totalLimitMinor)}
          </span>
        </div>

        {budget.categoryLimits.length > 0 && (
          <div className='flex flex-col gap-2'>
            <p className='text-sm font-medium'>
              {t('budgets.summary.categoryBreakdown')}
            </p>
            {budget.categoryLimits.map((cl) => {
              const category = categoryMap.get(cl.categoryKey)

              return (
                <div
                  key={cl.categoryKey}
                  className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    {category && (
                      <span
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span>{cl.categoryKey}</span>
                  </div>
                  <span className='text-muted-foreground'>
                    {formatCurrency(cl.limitMinor)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {unallocated > 0 && (
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              {t('budgets.summary.unallocated')}
            </span>
            <span className='text-muted-foreground'>
              {formatCurrency(unallocated)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { BudgetSummaryCard }
