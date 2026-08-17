import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { Card, CardDescription } from '@/components/ui/card'
import {
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
} from '@/features/expenses/api'
import {
  buildHouseholdNameMap,
  getSourceLabel,
} from '@/features/expenses/presentation'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  useCategoryPresentation,
} from '@/features/home/presentation'
import { getExpenseEditPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { notification } from '@/lib/telegram/haptics'

export const ExpenseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const expenseId = id ?? 'unknown'
  const expenseQuery = useExpenseDetailQuery(expenseId, {
    enabled: expenseId !== 'unknown',
  })
  const categoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()
  const deleteMutation = useDeleteExpenseMutation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const expense = expenseQuery.data
  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(householdsQuery.data?.items ?? []),
    [householdsQuery.data?.items],
  )
  const category = useCategoryPresentation(expense?.categoryKey)

  const handleDelete = async () => {
    if (!expense) return

    try {
      await deleteMutation.mutateAsync(expense.id)
      notification('success')
      navigate(TMA_PATHS.expenses, { replace: true })
    } catch {
      notification('error')
    }
  }

  if (expenseQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <TmaPageShell title={t('expenses.detail.title')}>
        <Card className='p-4'>
          <CardDescription>{t('expenses.detail.loading')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <TmaPageShell title={t('expenses.detail.title')}>
        <Card className='p-4'>
          <CardDescription>{t('expenses.detail.notFound')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  const dateLabel = formatDateLabel(new Date(expense.occurredAt).toISOString())
  const spaceLabel = expense.householdId
    ? householdNameMap.get(expense.householdId) ||
      t('expenses.detail.household')
    : t('expenses.detail.personal')

  return (
    <TmaPageShell title={t('expenses.detail.title')}>
      {/* Hero */}
      <Card className='mb-3 flex items-center gap-4 p-5'>
        <TmaCategoryIconBadge
          accent={category.accent}
          iconUrl={category.iconUrl}
          symbol={category.symbol}
        />
        <div className='min-w-0 flex-1'>
          <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
            {t('expenses.detail.amountSpent')}
          </p>
          <span className='mt-1 block font-mono text-[32px] leading-none font-extrabold text-foreground [font-variant-numeric:tabular-nums]'>
            {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
          </span>
        </div>
      </Card>

      {/* Info */}
      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.detail.sectionInfo')}
        </h2>
        <Card className='grid gap-3 p-4'>
          <div className='grid gap-1'>
            <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
              {t('expenses.detail.eyebrowTitle')}
            </p>
            <strong className='text-sm font-semibold wrap-break-word text-foreground'>
              {expense.title.trim() || category.label}
            </strong>
          </div>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              size='sm'
              symbol={category.symbol}
            />
            <div>
              <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                {t('expenses.detail.eyebrowCategory')}
              </p>
              <strong className='text-sm font-semibold text-foreground'>
                {category.label}
              </strong>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                {t('expenses.detail.eyebrowSource')}
              </p>
              <strong className='text-sm font-semibold text-foreground'>
                {getSourceLabel(expense.sourceKey, t)}
              </strong>
            </div>
            <div className='grid gap-1'>
              <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                {t('expenses.detail.eyebrowSpace')}
              </p>
              <strong className='text-sm font-semibold text-foreground'>
                {spaceLabel}
              </strong>
            </div>
          </div>
        </Card>
      </section>

      {/* Date & Time */}
      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.detail.sectionTime')}
        </h2>
        <Card className='grid gap-1 p-4'>
          <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
            {t('expenses.detail.eyebrowDate')}
          </p>
          <strong className='text-base font-semibold text-foreground'>
            {dateLabel}
          </strong>
        </Card>
      </section>

      {/* Actions */}
      {showDeleteConfirm ? (
        <Card className='mt-3 grid gap-3 border-[#d93838]/20 bg-[#ffeded]/90 p-4'>
          <div>
            <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-[#d93838] uppercase'>
              {t('expenses.detail.deleteConfirmTitle')}
            </p>
            <strong className='text-sm font-semibold text-foreground'>
              {t('expenses.detail.deleteConfirmBody')}
            </strong>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <TmaHapticButton
              disabled={deleteMutation.isPending}
              variant='destructive'
              onClick={handleDelete}>
              {t('expenses.detail.deleteForever')}
            </TmaHapticButton>
            <TmaHapticButton
              variant='ghost'
              onClick={() => {
                setShowDeleteConfirm(false)
              }}>
              {t('common.cancel')}
            </TmaHapticButton>
          </div>
        </Card>
      ) : (
        <div className='mt-6 grid grid-cols-2 gap-3'>
          <TmaHapticButton
            variant='outline'
            onClick={() => {
              navigate(getExpenseEditPath(expense.id))
            }}>
            {t('expenses.detail.editAction')}
          </TmaHapticButton>
          <TmaHapticButton
            className='bg-[#d93838]/10 text-[#d93838]'
            variant='ghost'
            onClick={() => {
              setShowDeleteConfirm(true)
            }}>
            {t('expenses.detail.deleteAction')}
          </TmaHapticButton>
        </div>
      )}
    </TmaPageShell>
  )
}
