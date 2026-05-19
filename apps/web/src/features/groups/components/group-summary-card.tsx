'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GroupSummaryDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'

type GroupSummaryCardProps = { summary: GroupSummaryDTO }

export function GroupSummaryCard({ summary }: GroupSummaryCardProps) {
  const {
    group,
    totalSpendMinor,
    expenseCount,
    budgetRemainingMinor,
    memberContributions,
  } = summary
  const hasBudget = group.eventBudgetMinor != null && group.eventBudgetMinor > 0
  const spendRatio = hasBudget
    ? Math.min((totalSpendMinor / group.eventBudgetMinor!) * 100, 100)
    : 0
  const isOverBudget = hasBudget && totalSpendMinor > group.eventBudgetMinor!

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('groups.summary.title')}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <div className='flex flex-col gap-1'>
            <span className='text-sm text-muted-foreground'>
              {t('groups.summary.totalSpend')}
            </span>
            <span className='text-lg font-semibold'>
              {formatCurrency(totalSpendMinor, 'VND')}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-sm text-muted-foreground'>
              {t('groups.summary.expenseCount')}
            </span>
            <span className='text-lg font-semibold'>{expenseCount}</span>
          </div>
          {hasBudget && (
            <>
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-muted-foreground'>
                  {t('groups.summary.budget')}
                </span>
                <span className='text-lg font-semibold'>
                  {formatCurrency(group.eventBudgetMinor!, 'VND')}
                </span>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-muted-foreground'>
                  {t('groups.summary.remaining')}
                </span>
                <span
                  className={`text-lg font-semibold ${isOverBudget ? 'text-destructive' : ''}`}>
                  {formatCurrency(budgetRemainingMinor ?? 0, 'VND')}
                </span>
              </div>
            </>
          )}
        </div>
        {hasBudget && (
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between text-sm'>
              <span>{t('groups.summary.progress')}</span>
              <span>{spendRatio.toFixed(0)}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${spendRatio}%` }}
              />
            </div>
          </div>
        )}
        {memberContributions.length > 0 && (
          <div className='flex flex-col gap-2'>
            <h4 className='text-sm font-medium'>
              {t('groups.summary.memberContributions')}
            </h4>
            <div className='flex flex-col gap-2'>
              {memberContributions.map((member) => (
                <div
                  key={member.userId}
                  className='flex items-center justify-between rounded-md border p-2'>
                  <span className='text-sm font-medium'>
                    {member.displayName}
                  </span>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-muted-foreground'>
                      {member.expenseCount} {t('groups.summary.expenses')}
                    </span>
                    <span className='text-sm font-semibold'>
                      {formatCurrency(member.totalSpendMinor, 'VND')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
