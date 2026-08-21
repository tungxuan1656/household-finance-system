import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'

import {
  formatOptionalGroupMoney,
  getGroupBudgetLabel,
  getGroupProgress,
} from '../presentation'
import type { ExpenseGroupDTO, GroupSummaryDTO } from '../types'

type GroupOverviewCardProps = {
  group: ExpenseGroupDTO
  summary: GroupSummaryDTO
}

export const GroupOverviewCard = ({
  group,
  summary,
}: GroupOverviewCardProps) => {
  const { t } = useTranslation()
  const totalSpendMinor = summary.totalSpendMinor ?? group.totalSpendMinor ?? 0
  const progress = getGroupProgress(totalSpendMinor, group.eventBudgetMinor)

  return (
    <Card size='sm'>
      <CardContent className='grid gap-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statTotalSpent')}
            </span>
            <span className='text-sm font-bold text-foreground tabular-nums'>
              {formatCurrencyMinor(totalSpendMinor, 'VND')}
            </span>
          </div>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statExpenseCount')}
            </span>
            <span className='text-sm font-bold text-foreground tabular-nums'>
              {summary.expenseCount}
            </span>
          </div>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statBudget')}
            </span>
            <span className='text-sm font-bold text-foreground tabular-nums'>
              {getGroupBudgetLabel(group, t)}
            </span>
          </div>
          <div className='grid gap-1'>
            <span className='text-xs text-muted-foreground'>
              {t('groups.detail.statRemaining')}
            </span>
            <span
              className={
                summary.budgetRemainingMinor != null &&
                summary.budgetRemainingMinor < 0
                  ? 'text-sm font-bold text-destructive tabular-nums'
                  : 'text-sm font-bold text-foreground tabular-nums'
              }>
              {formatOptionalGroupMoney(summary.budgetRemainingMinor ?? null)}
            </span>
          </div>
        </div>

        {progress ? (
          <div className='grid gap-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{t('groups.detail.statProgress')}</span>
              <span className='tabular-nums'>{progress.percentUsed}%</span>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-muted'>
              <div
                className={
                  progress.isOverBudget
                    ? 'h-full rounded-full bg-destructive'
                    : 'h-full rounded-full bg-primary'
                }
                style={{ width: `${progress.widthPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
