import { BudgetIcon } from '@/components/shared/tma-icons'
import { Card, Chip, Eyebrow, IconBadge, MoneyLabel } from '@/components/ui'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'

import { formatBudgetPeriodLabel, getBudgetScopeLabel } from '../presentation'
import type { BudgetDTO, BudgetStatusDTO } from '../types'

const budgetAccent = { background: '#fff6d9', foreground: '#b48800' }

type BudgetHeroCardProps = {
  budget: BudgetDTO
  status: BudgetStatusDTO | undefined
  household: HouseholdDTO | undefined
  t: (key: string, options?: Record<string, unknown>) => string
}

export const BudgetHeroCard = ({
  budget,
  status,
  household,
  t,
}: BudgetHeroCardProps) => (
  <Card className='grid gap-4 p-5'>
    <div className='flex items-start justify-between gap-3'>
      <div className='flex flex-wrap gap-1.5'>
        <Chip tone='primary'>{formatBudgetPeriodLabel(budget.period, t)}</Chip>
        <Chip
          className={
            budget.scope === 'personal'
              ? 'bg-tma-warning/20 text-[#8a6800]'
              : undefined
          }
          tone={budget.scope === 'personal' ? 'warning' : 'muted'}>
          {getBudgetScopeLabel(budget.scope, household, t)}
        </Chip>
      </div>
      <IconBadge accent={budgetAccent}>
        <BudgetIcon height={20} strokeWidth={2} width={20} />
      </IconBadge>
    </div>
    <div>
      <Eyebrow>{t('budgets.detail.statLimit')}</Eyebrow>
      <MoneyLabel className='text-[28px] leading-tight font-extrabold'>
        {formatCurrencyMinor(
          status?.totalPlannedMinor ?? budget.totalLimitMinor,
          budget.currencyCode,
        )}
      </MoneyLabel>
    </div>
  </Card>
)
