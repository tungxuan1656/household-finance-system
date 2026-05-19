'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel, getSourceLabel } from '@/lib/reference-data/labels'
import { formatCurrency } from '@/utils/currency/format'
import { DATE_TIME_FORMATS } from '@/utils/datetime/constants'
import { formatDate } from '@/utils/datetime/format'

import type { ExpenseDTO } from '../types/expense'

type ExpenseDetailCardProps = {
  expense: ExpenseDTO
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-baseline justify-between gap-4'>
      <span className='shrink-0 text-muted-foreground'>{label}</span>
      <span className='text-right'>{children}</span>
    </div>
  )
}

export const ExpenseDetailCard = ({ expense }: ExpenseDetailCardProps) => {
  const visibilityBadgeVariant =
    expense.visibility === 'private' ? 'outline' : 'secondary'
  const visibilityBadgeLabel =
    expense.visibility === 'private'
      ? t('expense.visibilityBadge.private')
      : t('expense.visibilityBadge.household')

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <CardTitle>{expense.title}</CardTitle>
          <Badge variant={visibilityBadgeVariant}>{visibilityBadgeLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-3'>
          {/* Core financial data */}
          <div className='flex flex-col gap-2'>
            <DetailRow label={t('expense.detail.amount')}>
              {formatCurrency(expense.amountMinor, expense.currencyCode)}
            </DetailRow>
            <DetailRow label={t('expense.detail.category')}>
              {getCategoryLabel(expense.categoryKey)}
            </DetailRow>
            <DetailRow label={t('expense.detail.source')}>
              {getSourceLabel(expense.sourceKey)}
            </DetailRow>
            <DetailRow label={t('expense.detail.date')}>
              {formatDate(expense.occurredAt, DATE_TIME_FORMATS.date)}
            </DetailRow>
          </div>

          <Separator />

          {/* Note */}
          <DetailRow label={t('expense.detail.note')}>
            {expense.note ? (
              expense.note
            ) : (
              <span className='text-muted-foreground'>—</span>
            )}
          </DetailRow>

          <Separator />

          {/* People & household */}
          <div className='flex flex-col gap-2'>
            <DetailRow label={t('expense.detail.payer')}>
              {expense.payerUserId}
            </DetailRow>
            <DetailRow label={t('expense.detail.creator')}>
              {expense.createdByUserId}
            </DetailRow>
            {expense.householdId && (
              <DetailRow label={t('expense.detail.household')}>
                {expense.householdId}
              </DetailRow>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className='flex flex-col gap-2'>
            <DetailRow label={t('expense.detail.createdAt')}>
              {formatDate(expense.createdAt, DATE_TIME_FORMATS.dateTime)}
            </DetailRow>
            <DetailRow label={t('expense.detail.updatedAt')}>
              {formatDate(expense.updatedAt, DATE_TIME_FORMATS.dateTime)}
            </DetailRow>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
