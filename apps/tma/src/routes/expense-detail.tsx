import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
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
  getCategoryPresentation,
} from '@/features/home/presentation'
import { getExpenseEditPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel, formatTimeLabel } from '@/lib/formatters'
import { impact, notification, selection } from '@/lib/telegram/haptics'

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
  const category = getCategoryPresentation(
    expense?.categoryKey,
    t,
    categoriesQuery.data?.items ?? [],
  )

  const handleDelete = async () => {
    if (!expense) return

    try {
      impact('heavy')

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
          <CardDescription>{t('expenses.detail.loading')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <TmaPageShell title={t('expenses.detail.title')}>
        <Card>
          <CardDescription>{t('expenses.detail.notFound')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  const dateLabel = formatDateLabel(new Date(expense.occurredAt).toISOString())
  const timeLabel = formatTimeLabel(new Date(expense.occurredAt).toISOString())
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
          <Eyebrow>{t('expenses.detail.amountSpent')}</Eyebrow>
          <MoneyLabel className='mt-1 block text-[32px] leading-none font-extrabold'>
            {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
          </MoneyLabel>
        </div>
      </Card>

      {/* Info */}
      <Section>
        <SectionHeader title={t('expenses.detail.sectionInfo')} />
        <Card className='grid gap-3'>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              size='sm'
              symbol={category.symbol}
            />
            <div>
              <Eyebrow>{t('expenses.detail.eyebrowCategory')}</Eyebrow>
              <strong className='text-sm font-semibold text-tma-text-strong'>
                {category.label}
              </strong>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <Eyebrow>{t('expenses.detail.eyebrowSource')}</Eyebrow>
              <strong className='text-sm font-semibold text-tma-text-strong'>
                {getSourceLabel(expense.sourceKey, t)}
              </strong>
            </div>
            <div className='grid gap-1'>
              <Eyebrow>{t('expenses.detail.eyebrowSpace')}</Eyebrow>
              <strong className='text-sm font-semibold text-tma-text-strong'>
                {spaceLabel}
              </strong>
            </div>
          </div>
        </Card>
      </Section>

      {/* Date & Time */}
      <Section>
        <SectionHeader title={t('expenses.detail.sectionTime')} />
        <Card className='grid gap-1'>
          <Eyebrow>{t('expenses.detail.eyebrowDateTime')}</Eyebrow>
          <strong className='text-base font-semibold text-tma-text-strong'>
            {dateLabel}, {timeLabel}
          </strong>
        </Card>
      </Section>

      {/* Actions */}
      {showDeleteConfirm ? (
        <Card className='mt-3 grid gap-3 border-[#d93838]/20 bg-[#ffeded]/90'>
          <div>
            <Eyebrow className='text-[#d93838]'>
              {t('expenses.detail.deleteConfirmTitle')}
            </Eyebrow>
            <strong className='text-sm font-semibold text-tma-text-strong'>
              {t('expenses.detail.deleteConfirmBody')}
            </strong>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              disabled={deleteMutation.isPending}
              variant='danger'
              onClick={handleDelete}>
              {t('expenses.detail.deleteForever')}
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                selection()
                setShowDeleteConfirm(false)
              }}>
              {t('common.cancel')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className='mt-6 grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            onClick={() => {
              selection()
              navigate(getExpenseEditPath(expense.id))
            }}>
            {t('expenses.detail.editAction')}
          </Button>
          <Button
            className='bg-[#d93838]/10 text-[#d93838]'
            variant='ghost'
            onClick={() => {
              selection()
              setShowDeleteConfirm(true)
            }}>
            {t('expenses.detail.deleteAction')}
          </Button>
        </div>
      )}
    </TmaPageShell>
  )
}
