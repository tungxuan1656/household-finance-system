import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { ExpenseSummaryDTO } from '@/features/home/types'

type ExpenseSummaryCardProps = {
  summary?: ExpenseSummaryDTO
}

export const ExpenseSummaryCard = ({ summary }: ExpenseSummaryCardProps) => {
  const { t } = useTranslation()

  if (!summary || summary.expenseCount === 0) return null

  return (
    <Card className='grid gap-1 p-5'>
      <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
        {t('expenses.summary.title')}
      </p>
      <span className='block font-mono text-[28px] leading-none font-extrabold tracking-normal text-foreground [font-variant-numeric:tabular-nums]'>
        {formatCurrencyMinor(summary.totalSpendMinor, summary.currencyCode)}
      </span>
      <p className='m-0 text-xs font-semibold text-muted-foreground'>
        {t('expenses.summary.count', { count: summary.expenseCount })}
      </p>
    </Card>
  )
}
