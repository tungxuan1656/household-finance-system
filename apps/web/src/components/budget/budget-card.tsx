'use client'

import { Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

type BudgetCardProps = {
  budget: BudgetDTO
  onEdit?: () => void
}

function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const { data: categoriesData } = useReferenceCategoriesQuery()
  const categories = categoriesData?.items ?? []

  const categoryMap = new Map<string, (typeof categories)[number]>(
    categories.map((cat) => [cat.key, cat]),
  )

  return (
    <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-1'>
            <CardTitle className='text-base'>
              {t('budgets.card.periodLabel')}: {budget.period}
            </CardTitle>
            <CardDescription>
              {t('budgets.card.totalLabel')}:{' '}
              {formatCurrency(budget.totalLimitMinor, budget.currencyCode)}
            </CardDescription>
          </div>
          {onEdit && (
            <Button
              className='h-11 min-w-11 shrink-0 gap-2'
              size='default'
              type='button'
              variant='outline'
              onClick={onEdit}>
              <Edit className='size-4' data-icon='inline-start' />
              <span className='hidden sm:inline'>
                {t('common.actions.edit')}
              </span>
            </Button>
          )}
        </div>
      </CardHeader>
      {budget.categoryLimits.length > 0 && (
        <CardContent className='flex flex-col gap-2'>
          <p className='text-sm font-medium'>
            {t('budgets.card.categoryBreakdown')}
          </p>
          <div className='flex flex-col gap-1'>
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
                    {formatCurrency(cl.limitMinor, budget.currencyCode)}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export { BudgetCard }
