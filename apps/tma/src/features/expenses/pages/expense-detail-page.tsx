import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
  TmaPageFooter,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
} from '@/features/expenses/api'
import {
  buildHouseholdNameMap,
  getSourceLabel,
} from '@/features/expenses/presentation'
import { useHouseholdsQuery } from '@/features/home/api'
import {
  formatCurrencyMinor,
  useCategoryPresentation,
} from '@/features/home/presentation'
import type { ExpenseDTO } from '@/features/home/types'
import { getExpenseEditPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { notification } from '@/lib/telegram/haptics'

const ExpenseDetailContent = ({
  expense,
  householdNameMap,
}: {
  expense: ExpenseDTO
  householdNameMap: Map<string, string>
}) => {
  const { t } = useTranslation()
  const category = useCategoryPresentation(expense.categoryKey)
  const dateLabel = formatDateLabel(new Date(expense.occurredAt).toISOString())
  const spaceLabel = expense.householdId
    ? (householdNameMap.get(expense.householdId) ??
      t('expenses.detail.household'))
    : t('expenses.detail.personal')

  return (
    <>
      <Card size='sm'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              symbol={category.symbol}
            />
            <div className='min-w-0 flex-1'>
              <CardDescription>
                {t('expenses.detail.amountSpent')}
              </CardDescription>
              <CardTitle className='font-mono text-[32px] leading-none font-extrabold [font-variant-numeric:tabular-nums]'>
                {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card size='sm'>
        <CardContent className='grid gap-3 divide-y divide-border/60 *:py-3 first:*:pt-0'>
          <div className='grid gap-1'>
            <CardDescription>
              {t('expenses.detail.eyebrowTitle')}
            </CardDescription>
            <p className='text-sm font-semibold wrap-break-word'>
              {expense.title.trim() || category.label}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              size='sm'
              symbol={category.symbol}
            />
            <div>
              <CardDescription>
                {t('expenses.detail.eyebrowCategory')}
              </CardDescription>
              <p className='text-sm font-semibold'>{category.label}</p>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid min-w-0 gap-1'>
              <CardDescription>
                {t('expenses.detail.eyebrowSource')}
              </CardDescription>
              <p className='truncate text-sm font-semibold'>
                {getSourceLabel(expense.sourceKey, t)}
              </p>
            </div>
            <div className='grid min-w-0 gap-1'>
              <CardDescription>
                {t('expenses.detail.eyebrowSpace')}
              </CardDescription>
              <p className='truncate text-sm font-semibold'>{spaceLabel}</p>
            </div>
          </div>
          <div className='grid gap-1'>
            <CardDescription>
              {t('expenses.detail.eyebrowDate')}
            </CardDescription>
            <p className='text-base font-semibold'>{dateLabel}</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export const ExpenseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const expenseId = id ?? 'unknown'
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const householdsQuery = useHouseholdsQuery()
  const deleteMutation = useDeleteExpenseMutation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(householdsQuery.data?.items ?? []),
    [householdsQuery.data?.items],
  )

  const handleDelete = async () => {
    const targetId = expenseQuery.data?.id
    if (!targetId) return

    try {
      await deleteMutation.mutateAsync(targetId)
      notification('success')
      navigate(TMA_PATHS.expenses, { replace: true })
    } catch {
      notification('error')
    }
  }

  const footer = expenseQuery.data ? (
    showDeleteConfirm ? (
      <TmaPageFooter>
        <TmaHapticButton
          className='flex-1'
          disabled={deleteMutation.isPending}
          variant='destructive'
          onClick={handleDelete}>
          {t('expenses.detail.deleteForever')}
        </TmaHapticButton>
        <TmaHapticButton
          className='flex-1'
          variant='ghost'
          onClick={() => setShowDeleteConfirm(false)}>
          {t('common.cancel')}
        </TmaHapticButton>
      </TmaPageFooter>
    ) : (
      <TmaPageFooter>
        <TmaHapticButton
          className='flex-1'
          variant='outline'
          onClick={() => navigate(getExpenseEditPath(expenseQuery.data.id))}>
          {t('expenses.detail.editAction')}
        </TmaHapticButton>
        <TmaHapticButton
          className='flex-1'
          variant='destructive'
          onClick={() => setShowDeleteConfirm(true)}>
          {t('expenses.detail.deleteAction')}
        </TmaHapticButton>
      </TmaPageFooter>
    )
  ) : undefined

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={footer}
      title={t('expenses.detail.title')}>
      <QueryState
        error={{
          title: t('dataState.errorTitle'),
          description: t('dataState.errorDescription'),
        }}
        pending={{
          title: t('expenses.detail.loading'),
          description: '',
        }}
        query={expenseQuery}
        variant='card'>
        {(expense) => (
          <ExpenseDetailContent
            expense={expense}
            householdNameMap={householdNameMap}
          />
        )}
      </QueryState>
    </TmaPageShell>
  )
}
