import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { PlusIcon, TrashIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyMinor } from '@/features/home/presentation'
import {
  useDeleteIncomeMutation,
  useIncomesInfiniteQuery,
} from '@/features/incomes/api'
import type { IncomeDTO } from '@/features/incomes/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { impact, notification, selection } from '@/lib/telegram/haptics'

export const IncomesPage = () => {
  const { t } = useTranslation()
  const incomesQuery = useIncomesInfiniteQuery()

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-3'
      title={t('incomes.title')}
      onRefresh={async () => {
        await incomesQuery.refetch()
      }}>
      <QueryState
        empty={{
          title: t('incomes.emptyTitle'),
          description: t('incomes.emptyDesc'),
          action: (
            <Link
              className='inline-flex h-9 items-center justify-center rounded-none bg-primary px-4 text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/80'
              to={TMA_PATHS.incomesNew}
              onClick={() => impact('light')}>
              {t('incomes.addTitle')}
            </Link>
          ),
        }}
        error={{
          title: t('dataState.errorTitle'),
          description: t('dataState.errorDescription'),
        }}
        isEmpty={(data) =>
          data.pages.flatMap((page) => page.items).length === 0
        }
        pending={<IncomesSkeleton />}
        query={incomesQuery}
        retryAction={() => void incomesQuery.refetch()}
        variant='card'>
        {(data) => {
          const incomes = data.pages.flatMap((page) => page.items)

          return (
            <>
              <div className='flex flex-col gap-2'>
                {incomes.map((income) => (
                  <IncomeCard key={income.id} income={income} />
                ))}
              </div>

              {incomesQuery.hasNextPage && (
                <div className='flex justify-center pt-2'>
                  <TmaHapticButton
                    disabled={incomesQuery.isFetchingNextPage}
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      void incomesQuery.fetchNextPage()
                    }}>
                    {incomesQuery.isFetchingNextPage
                      ? t('incomes.loadingMore', {
                          defaultValue: t('expenses.loadingMore'),
                        })
                      : t('incomes.loadMore', {
                          defaultValue: t('expenses.loadMore'),
                        })}
                  </TmaHapticButton>
                </div>
              )}
            </>
          )
        }}
      </QueryState>

      <IncomesAddFab />
    </TmaPageShell>
  )
}

const IncomeCard = ({ income }: { income: IncomeDTO }) => {
  const { t } = useTranslation()
  const [confirm, setConfirm] = useState(false)
  const deleteMutation = useDeleteIncomeMutation()

  const handleDeleteStart = () => {
    selection()
    setConfirm(true)
  }

  const handleDeleteCancel = () => {
    setConfirm(false)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(income.id)
      notification('success')
      setConfirm(false)
    } catch {
      // NOT_FOUND handled in mutation onError with invalidate; keep local state clean
      setConfirm(false)
    }
  }

  return (
    <Card className='gap-2' size='sm'>
      <CardHeader className='gap-1 pb-1'>
        <CardDescription className='text-xs'>
          {formatDateLabel(new Date(income.occurredAt).toISOString())}
        </CardDescription>
        <CardTitle className='line-clamp-1 text-sm tracking-normal normal-case'>
          {income.title || t('incomes.nameUnset')}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex min-w-0 items-center gap-3'>
        <span className='min-w-0 flex-1 truncate font-mono text-lg font-semibold text-green-600'>
          +{formatCurrencyMinor(income.amountMinor, income.currencyCode)}
        </span>

        {confirm ? (
          <div className='flex shrink-0 items-center gap-1.5'>
            <TmaHapticButton
              className='h-9 px-3'
              disabled={deleteMutation.isPending}
              size='sm'
              variant='destructive'
              onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </TmaHapticButton>
            <TmaHapticButton
              className='h-9 px-3'
              disabled={deleteMutation.isPending}
              size='sm'
              variant='ghost'
              onClick={handleDeleteCancel}>
              {t('common.cancel')}
            </TmaHapticButton>
          </div>
        ) : (
          <TmaHapticButton
            aria-label={t('incomes.deleteAction')}
            className='shrink-0'
            size='icon-sm'
            variant='ghost'
            onClick={handleDeleteStart}>
            <TrashIcon height='17' width='17' />
          </TmaHapticButton>
        )}
      </CardContent>
    </Card>
  )
}

const IncomesSkeleton = () => (
  <div className='flex flex-col gap-2'>
    {[0, 1, 2].map((i) => (
      <Card key={i} size='sm'>
        <CardHeader className='gap-2'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-4 w-32' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-6 w-28' />
        </CardContent>
      </Card>
    ))}
  </div>
)

const IncomesAddFab = () => {
  const { t } = useTranslation()

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-[calc(14px+var(--tma-content-safe-bottom))] z-30 flex justify-center px-4'>
      <Link
        aria-label={t('incomes.addTitle')}
        className='pointer-events-auto grid size-14 place-items-center rounded-full bg-linear-to-br from-green-500 to-green-600 text-white shadow-[0_8px_20px_rgba(17,24,39,0.16),inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_4px_rgba(255,255,255,0.55)] transition active:scale-95'
        to={TMA_PATHS.incomesNew}
        onClick={() => {
          impact('medium')
        }}>
        <PlusIcon height='24' width='24' />
      </Link>
    </div>
  )
}
