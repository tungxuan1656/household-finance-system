'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  BudgetStatusCategoryKey,
  BudgetStatusDTO,
  BudgetTotalStatus,
} from '@/features/budgets/types/budget'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency/format'

type BudgetStatusCardProps = { status: BudgetStatusDTO }

const statusColor = (status: BudgetTotalStatus) =>
  status === 'ok'
    ? 'bg-status-success'
    : status === 'warning'
      ? 'bg-status-warning'
      : status === 'exceeded'
        ? 'bg-destructive'
        : 'bg-muted'
const statusBadgeVariant = (status: BudgetTotalStatus) =>
  status === 'ok'
    ? 'default'
    : status === 'warning'
      ? 'secondary'
      : status === 'exceeded'
        ? 'destructive'
        : 'outline'
const statusBadgeClass = (status: BudgetTotalStatus) =>
  status === 'ok'
    ? 'bg-status-success/20 text-status-success hover:bg-status-success/20 dark:bg-status-success/30 dark:text-status-success-foreground'
    : status === 'warning'
      ? 'bg-status-warning/20 text-status-warning hover:bg-status-warning/20 dark:bg-status-warning/30 dark:text-status-warning-foreground'
      : status === 'exceeded'
        ? 'bg-destructive/10 text-destructive hover:bg-destructive/10'
        : ''
const statusLabel = (status: BudgetTotalStatus) =>
  t(`budgets.status.labels.${status}`)
const categoryStatusLabel = (status: BudgetTotalStatus) =>
  t(`budgets.status.labels.${status}`)
function BudgetStatusCard({ status }: BudgetStatusCardProps) {
  const { data } = useReferenceCategoriesQuery()
  const categoryMap = new Map((data?.items ?? []).map((cat) => [cat.key, cat]))

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex flex-col gap-1'>
            <CardTitle className='text-base md:text-lg'>
              {t('budgets.status.title')}
            </CardTitle>
            <CardDescription>
              {t('budgets.status.period')}: {status.period}
            </CardDescription>
          </div>
          <Badge
            className={cn(
              'shrink-0 text-xs',
              statusBadgeClass(status.totalStatus),
            )}
            variant={statusBadgeVariant(status.totalStatus)}>
            {statusLabel(status.totalStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              {t('budgets.status.totalPlanned')}
            </span>
            <span className='font-medium tabular-nums'>
              {formatCurrency(status.totalPlannedMinor, status.currencyCode)}
            </span>
          </div>
          <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                statusColor(status.totalStatus),
              )}
              style={{ width: `${Math.min(status.totalPercentUsed, 100)}%` }}
            />
          </div>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {t('budgets.status.totalActual')}:{' '}
              {formatCurrency(status.totalActualMinor, status.currencyCode)}
            </span>
            <span className='font-medium text-foreground'>
              {status.totalPercentUsed}%
            </span>
          </div>
        </div>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div className='rounded-lg bg-muted/50 px-3 py-2.5'>
            <p className='text-xs text-muted-foreground'>
              {t('budgets.status.totalActual')}
            </p>
            <p className='mt-0.5 text-sm font-semibold tabular-nums'>
              {formatCurrency(status.totalActualMinor, status.currencyCode)}
            </p>
          </div>
          <div className='rounded-lg bg-muted/50 px-3 py-2.5'>
            <p className='text-xs text-muted-foreground'>
              {t('budgets.status.totalRemaining')}
            </p>
            <p
              className={cn(
                'mt-0.5 text-sm font-semibold tabular-nums',
                status.totalRemainingMinor < 0
                  ? 'text-destructive'
                  : 'text-foreground',
              )}>
              {formatCurrency(status.totalRemainingMinor, status.currencyCode)}
            </p>
          </div>
          <div className='rounded-lg bg-muted/50 px-3 py-2.5'>
            <p className='text-xs text-muted-foreground'>
              {t('budgets.status.totalStatus')}
            </p>
            <p className='mt-0.5 text-sm font-semibold'>
              {status.totalPercentUsed}%
            </p>
          </div>
        </div>
        {status.categoryStatuses.length > 0 ? (
          <div className='flex flex-col gap-3'>
            <p className='text-sm font-medium'>
              {t('budgets.status.categoryBreakdown')}
            </p>
            <div className='flex flex-col gap-3'>
              {status.categoryStatuses.map((category) => {
                const meta = categoryMap.get(category.categoryKey)
                const percentUsed = Math.round(
                  (category.actualSpendMinor / category.plannedLimitMinor) *
                    100,
                )

                return (
                  <div
                    key={category.categoryKey}
                    className='flex flex-col gap-1.5'>
                    <div className='flex items-center justify-between gap-2 text-sm'>
                      <div className='flex min-w-0 items-center gap-2'>
                        {meta && (
                          <span
                            className='inline-block h-2.5 w-2.5 shrink-0 rounded-full'
                            style={{ backgroundColor: meta.color }}
                          />
                        )}
                        <span className='truncate'>
                          {getCategoryLabel(
                            category.categoryKey as BudgetStatusCategoryKey,
                          )}
                        </span>
                      </div>
                      <div className='flex shrink-0 items-center gap-2'>
                        <Badge
                          className={cn(
                            'text-xs',
                            statusBadgeClass(category.status),
                          )}
                          variant={statusBadgeVariant(category.status)}>
                          {categoryStatusLabel(category.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-muted'>
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            statusColor(category.status),
                          )}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>
                      <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                        {formatCurrency(
                          category.actualSpendMinor,
                          status.currencyCode,
                        )}{' '}
                        /{' '}
                        {formatCurrency(
                          category.plannedLimitMinor,
                          status.currencyCode,
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { BudgetStatusCard }
