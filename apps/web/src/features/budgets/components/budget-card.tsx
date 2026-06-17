'use client'

import { Edit, House, Trash2, User } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { BudgetDTO } from '@/features/budgets/types/budget'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'

type BudgetCardProps = {
  budget: BudgetDTO
  onDelete?: () => Promise<void>
  onEdit?: () => void
  isDeleting?: boolean
}

function BudgetCard({
  budget,
  onDelete,
  onEdit,
  isDeleting = false,
}: BudgetCardProps) {
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
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base'>
                {t('budgets.card.periodLabel')}: {budget.period}
              </CardTitle>
              {budget.scope === 'personal' && (
                <Badge variant='outline'>
                  <User className='size-3' data-icon='inline-start' />
                  {t('budgets.badge.personal')}
                </Badge>
              )}
              {budget.scope === 'household' && (
                <Badge variant='secondary'>
                  <House className='size-3' data-icon='inline-start' />
                  {t('budgets.badge.household')}
                </Badge>
              )}
            </div>
            <CardDescription>
              {t('budgets.card.totalLabel')}:{' '}
              {formatCurrency(budget.totalLimitMinor, budget.currencyCode)}
            </CardDescription>
          </div>
          {(onEdit || onDelete) && (
            <div className='flex shrink-0 flex-wrap justify-end gap-2'>
              {onEdit && (
                <Button
                  className='gap-2'
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
              {onDelete && (
                <ConfirmDialog
                  confirmLabel={t('budgets.delete.confirm')}
                  confirmLoading={isDeleting}
                  description={t('budgets.delete.description')}
                  title={t('budgets.delete.title')}
                  trigger={
                    <Button
                      className='gap-2'
                      disabled={isDeleting}
                      size='default'
                      type='button'
                      variant='destructive'>
                      <Trash2 className='size-4' data-icon='inline-start' />
                      <span className='hidden sm:inline'>
                        {t('common.actions.delete')}
                      </span>
                    </Button>
                  }
                  variant='destructive'
                  onConfirm={onDelete}
                />
              )}
            </div>
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
