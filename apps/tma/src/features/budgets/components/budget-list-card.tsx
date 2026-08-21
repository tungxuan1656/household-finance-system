import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'
import { getBudgetDetailPath } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import { formatBudgetPeriodLabel, getBudgetScopeLabel } from '../presentation'
import type { BudgetDTO } from '../types'

type BudgetListCardProps = {
  budget: BudgetDTO
  household?: HouseholdDTO
}

export const BudgetListCard = ({ budget, household }: BudgetListCardProps) => {
  const { t } = useTranslation()

  return (
    <Link
      className='block rounded-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
      to={getBudgetDetailPath(budget.id)}
      onClick={() => impact('light')}>
      <Card
        className='transition hover:bg-accent/40 active:scale-[0.99]'
        size='sm'>
        <CardHeader className='gap-1.5'>
          <CardTitle className='text-base font-semibold tracking-normal normal-case'>
            {formatBudgetPeriodLabel(budget.period, t)}
          </CardTitle>
          <Badge
            variant={budget.scope === 'personal' ? 'secondary' : 'outline'}>
            {getBudgetScopeLabel(budget.scope, household, t)}
          </Badge>
        </CardHeader>
        <CardContent className='flex items-center justify-between gap-3'>
          <span className='shrink-0 text-base font-extrabold text-foreground tabular-nums'>
            {formatCurrencyMinor(budget.totalLimitMinor, budget.currencyCode)}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
