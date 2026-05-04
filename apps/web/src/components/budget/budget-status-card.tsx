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
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type {
  BudgetStatusCategoryKey,
  BudgetStatusDTO,
  BudgetTotalStatus,
} from '@/types/budget'

function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

type BudgetStatusCardProps = { status: BudgetStatusDTO }

function statusLabel(status: BudgetTotalStatus) {
  return t(`budgets.status.labels.${status}`)
}

function categoryStatusLabel(status: BudgetTotalStatus) {
  return t(`budgets.status.labels.${status}`)
}

function BudgetStatusCard({ status }: BudgetStatusCardProps) {
  const { data } = useReferenceCategoriesQuery()
  const categoryMap = new Map((data?.items ?? []).map((cat) => [cat.key, cat]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('budgets.status.title')}</CardTitle>
        <CardDescription>
          {t('budgets.status.period')}: {status.period}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <p className='text-sm text-muted-foreground'>
              {t('budgets.status.totalPlanned')}
            </p>
            <p className='font-medium'>
              {formatCurrency(status.totalPlannedMinor, status.currencyCode)}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              {t('budgets.status.totalActual')}
            </p>
            <p className='font-medium'>
              {formatCurrency(status.totalActualMinor, status.currencyCode)}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              {t('budgets.status.totalRemaining')}
            </p>
            <p className='font-medium'>
              {formatCurrency(status.totalRemainingMinor, status.currencyCode)}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              {t('budgets.status.totalStatus')}
            </p>
            <p className='font-medium'>
              {statusLabel(status.totalStatus)} · {status.totalPercentUsed}%
            </p>
          </div>
        </div>
        {status.categoryStatuses.length > 0 ? (
          <div className='flex flex-col gap-2'>
            <p className='text-sm font-medium'>
              {t('budgets.status.categoryBreakdown')}
            </p>
            {status.categoryStatuses.map((category) => {
              const meta = categoryMap.get(category.categoryKey)

              return (
                <div
                  key={category.categoryKey}
                  className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    {meta && (
                      <span
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ backgroundColor: meta.color }}
                      />
                    )}
                    <span>
                      {getCategoryLabel(
                        category.categoryKey as BudgetStatusCategoryKey,
                      )}
                    </span>
                  </div>
                  <span className='text-muted-foreground'>
                    {formatCurrency(
                      category.actualSpendMinor,
                      status.currencyCode,
                    )}{' '}
                    /{' '}
                    {formatCurrency(
                      category.plannedLimitMinor,
                      status.currencyCode,
                    )}{' '}
                    · {categoryStatusLabel(category.status)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { BudgetStatusCard }
