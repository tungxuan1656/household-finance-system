import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
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
        <Card>
          <CardHeader>
            <CardDescription>{t('expenses.detail.loading')}</CardDescription>
          </CardHeader>
        </Card>
      </TmaPageShell>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <TmaPageShell title={t('expenses.detail.title')}>
        <Card>
          <CardHeader>
            <CardDescription>{t('expenses.detail.notFound')}</CardDescription>
          </CardHeader>
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
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
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

      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.detail.sectionInfo')}
        </h2>
        <Card>
          <CardContent className='grid gap-3'>
            <div className='grid gap-1'>
              <CardDescription>
                {t('expenses.detail.eyebrowTitle')}
              </CardDescription>
              <p className='text-sm font-semibold wrap-break-word text-foreground'>
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
                <p className='text-sm font-semibold text-foreground'>
                  {category.label}
                </p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='grid gap-1'>
                <CardDescription>
                  {t('expenses.detail.eyebrowSource')}
                </CardDescription>
                <p className='text-sm font-semibold text-foreground'>
                  {getSourceLabel(expense.sourceKey, t)}
                </p>
              </div>
              <div className='grid gap-1'>
                <CardDescription>
                  {t('expenses.detail.eyebrowSpace')}
                </CardDescription>
                <p className='text-sm font-semibold text-foreground'>
                  {spaceLabel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mt-6'>
        <h2 className='mb-3 text-base leading-tight font-semibold text-foreground'>
          {t('expenses.detail.sectionTime')}
        </h2>
        <Card>
          <CardContent className='grid gap-1'>
            <CardDescription>
              {t('expenses.detail.eyebrowDate')}
            </CardDescription>
            <p className='text-base font-semibold text-foreground'>
              {dateLabel}
            </p>
          </CardContent>
        </Card>
      </section>

      {showDeleteConfirm ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-destructive'>
              {t('expenses.detail.deleteConfirmTitle')}
            </CardTitle>
            <CardDescription>
              {t('expenses.detail.deleteConfirmBody')}
            </CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-2'>
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
          </CardContent>
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
            variant='destructive'
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
