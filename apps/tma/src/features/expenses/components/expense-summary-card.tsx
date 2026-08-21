import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { ExpenseSummaryDTO } from '@/features/home/types'

type ExpenseSummaryCardProps = {
  summary?: ExpenseSummaryDTO
}

export const ExpenseSummaryCard = ({ summary }: ExpenseSummaryCardProps) => {
  const { t } = useTranslation()

  if (!summary || summary.expenseCount === 0) return null

  return (
    <Card size='sm'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-semibold tracking-normal normal-case'>
          {t('expenses.summary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className='grid gap-1'>
        <span className='block font-mono text-[28px] leading-none font-extrabold tracking-normal text-foreground tabular-nums [font-variant-numeric:tabular-nums]'>
          {formatCurrencyMinor(summary.totalSpendMinor, summary.currencyCode)}
        </span>
        <CardDescription>
          {t('expenses.summary.count', { count: summary.expenseCount })}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
