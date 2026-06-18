import { useTranslation } from 'react-i18next'

import { Card, Eyebrow, MoneyLabel } from '@/components/ui'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { ExpenseDTO } from '@/features/home/types'

type ExpenseSummaryCardProps = {
  expenses: ExpenseDTO[]
}

export const ExpenseSummaryCard = ({ expenses }: ExpenseSummaryCardProps) => {
  const { t } = useTranslation()

  if (expenses.length === 0) return null

  const currencyCode = expenses[0]?.currencyCode ?? 'VND'
  const totalMinor = expenses.reduce((sum, e) => sum + e.amountMinor, 0)
  const count = expenses.length

  return (
    <Card className='grid gap-1 p-5'>
      <Eyebrow>{t('expenses.summary.title')}</Eyebrow>
      <MoneyLabel className='block text-[28px] leading-none font-extrabold tracking-normal'>
        {formatCurrencyMinor(totalMinor, currencyCode)}
      </MoneyLabel>
      <p className='m-0 text-xs font-semibold text-tma-text-muted'>
        {t('expenses.summary.count', { count })}
      </p>
    </Card>
  )
}
