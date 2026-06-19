import { useTranslation } from 'react-i18next'

import { Card, Eyebrow, MoneyLabel } from '@/components/ui'
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
      <Eyebrow>{t('expenses.summary.title')}</Eyebrow>
      <MoneyLabel className='block text-[28px] leading-none font-extrabold tracking-normal'>
        {formatCurrencyMinor(summary.totalSpendMinor, summary.currencyCode)}
      </MoneyLabel>
      <p className='m-0 text-xs font-semibold text-tma-text-muted'>
        {t('expenses.summary.count', { count: summary.expenseCount })}
      </p>
    </Card>
  )
}
