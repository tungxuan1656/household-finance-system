'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import { getSourceLabel } from '@/lib/reference-data/labels'
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
  const { data: referenceCategories } = useReferenceCategoriesQuery()
  const category = getCategoryPresentation(
    expense.categoryKey,
    referenceCategories?.items,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-3'>
          {/* Core financial data */}
          <div className='flex flex-col gap-2'>
            <DetailRow label={t('expense.detail.amount')}>
              <span className='font-mono text-2xl font-semibold tabular-nums'>
                {formatCurrency(expense.amountMinor, expense.currencyCode)}
              </span>
            </DetailRow>
            <DetailRow label={t('expense.detail.category')}>
              <span className='inline-flex items-center gap-2'>
                {category.iconUrl ? (
                  <Badge
                    className='size-6 p-1'
                    style={{
                      backgroundColor: (category.color ?? '#000000') + '1A',
                    }}
                    variant='secondary'>
                    <img
                      alt={category.label}
                      className='size-4'
                      src={category.iconUrl}
                    />
                  </Badge>
                ) : null}
                <span>{category.label}</span>
              </span>
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

          {expense.householdId && (
            <>
              <DetailRow label={t('expense.detail.household')}>
                {expense.householdId}
              </DetailRow>
              <Separator />
            </>
          )}

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
