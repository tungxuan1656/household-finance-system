import { BudgetIcon } from '@/components/shared/tma-icons'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'

import { formatBudgetPeriodLabel, getBudgetScopeLabel } from '../presentation'
import type { BudgetDTO, BudgetStatusDTO } from '../types'

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
        <Badge>{formatBudgetPeriodLabel(budget.period, t)}</Badge>
        <Badge
          className={
            budget.scope === 'personal'
              ? 'bg-amber-400/20 text-[#8a6800]'
              : undefined
          }
          variant={budget.scope === 'personal' ? 'secondary' : 'outline'}>
          {getBudgetScopeLabel(budget.scope, household, t)}
        </Badge>
      </div>
      <div className='flex size-10 items-center justify-center rounded-full bg-[#fff6d9] text-[#b48800]'>
        <BudgetIcon height={20} strokeWidth={2} width={20} />
      </div>
    </div>
    <div>
      <span className='text-xs font-medium text-muted-foreground'>
        {t('budgets.detail.statLimit')}
      </span>
      <span className='text-[28px] leading-tight font-extrabold text-foreground'>
        {formatCurrencyMinor(
          status?.totalPlannedMinor ?? budget.totalLimitMinor,
          budget.currencyCode,
        )}
      </span>
    </div>
  </Card>
)
