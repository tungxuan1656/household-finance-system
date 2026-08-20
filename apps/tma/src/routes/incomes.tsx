import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { PlusIcon, TrashIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'
import {
  useDeleteIncomeMutation,
  useIncomesInfiniteQuery,
} from '@/features/incomes/api'
import { ApiClientError } from '@/lib/api/client'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { impact, notification, selection } from '@/lib/telegram/haptics'

export const IncomesPage = () => {
  const { t } = useTranslation()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const incomesQuery = useIncomesInfiniteQuery()
  const deleteIncomeMutation = useDeleteIncomeMutation()

  const incomes = incomesQuery.data?.pages.flatMap((page) => page.items) ?? []

  const handleDeleteStart = (incomeId: string) => {
    selection()
    setConfirmDeleteId(incomeId)
  }

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null)
  }

  const handleDeleteConfirm = async (incomeId: string) => {
    try {
      await deleteIncomeMutation.mutateAsync(incomeId)
      notification('success')
      setConfirmDeleteId(null)
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'NOT_FOUND') {
        setConfirmDeleteId(null)
      }
    }
  }

  if (incomesQuery.isLoading) {
    return (
      <TmaPageShell title={t('incomes.title')}>
        <Card>
          <CardHeader>
            <CardTitle>{t('incomes.loadingTitle')}</CardTitle>
            <CardDescription>{t('incomes.loadingDesc')}</CardDescription>
          </CardHeader>
        </Card>
        <IncomesAddFab />
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('incomes.title')}>
      {incomes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('incomes.emptyTitle')}</CardTitle>
            <CardDescription>{t('incomes.emptyDesc')}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid gap-2'>
          {incomes.map((income) => (
            <Card key={income.id} size='sm'>
              <CardHeader>
                <CardTitle>
                  {formatDateLabel(new Date(income.occurredAt).toISOString())}
                </CardTitle>
                <CardDescription>
                  {income.title || t('incomes.nameUnset')}
                </CardDescription>
              </CardHeader>
              <CardContent className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='font-mono text-lg font-semibold text-green-600'>
                    +
                    {formatCurrencyMinor(
                      income.amountMinor,
                      income.currencyCode,
                    )}
                  </span>

                  {confirmDeleteId === income.id ? (
                    <div className='flex gap-1'>
                      <TmaHapticButton
                        className='h-8 px-2 text-xs'
                        disabled={deleteIncomeMutation.isPending}
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDeleteConfirm(income.id)}>
                        {t('common.delete')}
                      </TmaHapticButton>
                      <TmaHapticButton
                        className='h-8 px-2 text-xs'
                        disabled={deleteIncomeMutation.isPending}
                        size='sm'
                        variant='ghost'
                        onClick={handleDeleteCancel}>
                        {t('common.cancel')}
                      </TmaHapticButton>
                    </div>
                  ) : (
                    <Button
                      aria-label={t('incomes.deleteAction')}
                      size='icon-xs'
                      variant='ghost'
                      onClick={() => handleDeleteStart(income.id)}>
                      <TrashIcon height='17' width='17' />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {incomesQuery.hasNextPage && (
        <div className='mt-4 flex justify-center'>
          <TmaHapticButton
            disabled={incomesQuery.isFetchingNextPage}
            size='sm'
            variant='outline'
            onClick={() => {
              void incomesQuery.fetchNextPage()
            }}>
            {incomesQuery.isFetchingNextPage
              ? t('expenses.loadingMore')
              : t('expenses.loadMore')}
          </TmaHapticButton>
        </div>
      )}

      <IncomesAddFab />
    </TmaPageShell>
  )
}

const IncomesAddFab = () => {
  const { t } = useTranslation()

  const prefetchAddIncome = () => {
    void import('@/routes/add-income').catch(() => undefined)
  }

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-[calc(14px+var(--tma-content-safe-bottom))] z-30 flex justify-center px-4'>
      <TmaHapticButton size='sm' variant='secondary'>
        <Link
          aria-label={t('incomes.addTitle')}
          className='pointer-events-auto grid size-13.5 place-items-center rounded-full bg-linear-to-br from-green-500 to-green-600 text-white shadow-[0_8px_20px_rgba(17,24,39,0.16),inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_4px_rgba(255,255,255,0.55)] transition active:scale-95'
          to={TMA_PATHS.incomesNew}
          onClick={() => {
            impact('medium')
          }}
          onMouseEnter={prefetchAddIncome}
          onTouchStart={prefetchAddIncome}>
          <PlusIcon height='24' width='24' />
        </Link>
      </TmaHapticButton>
    </div>
  )
}
