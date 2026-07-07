import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PlusIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Section,
} from '@/components/ui'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { useIncomesInfiniteQuery } from '@/features/incomes/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

export const IncomesPage = () => {
  const { t } = useTranslation()
  const incomesQuery = useIncomesInfiniteQuery()

  const incomes = incomesQuery.data?.pages.flatMap((page) => page.items) ?? []

  if (incomesQuery.isLoading) {
    return (
      <TmaPageShell title={t('incomes.title')}>
        <Card>
          <CardTitle>{t('incomes.loadingTitle')}</CardTitle>
          <CardDescription>{t('incomes.loadingDesc')}</CardDescription>
        </Card>
        <IncomesAddFab />
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('incomes.title')}>
      <Section>
        <h2 className='py-3 text-lg font-bold text-tma-text-strong'>
          {t('incomes.listTitle')}
        </h2>
      </Section>

      {incomes.length === 0 ? (
        <Card>
          <CardTitle>{t('incomes.emptyTitle')}</CardTitle>
          <CardDescription>{t('incomes.emptyDesc')}</CardDescription>
        </Card>
      ) : (
        <div className='grid gap-2'>
          {incomes.map((income) => (
            <Card key={income.id}>
              <div className='flex items-center justify-between'>
                <div className='grid gap-0.5'>
                  <CardTitle>
                    {new Date(income.occurredAt).toLocaleDateString('vi-VN')}
                  </CardTitle>
                  <CardDescription>
                    {income.title || t('incomes.nameUnset')}
                  </CardDescription>
                </div>
                <span className='font-mono text-lg font-semibold text-green-600'>
                  +
                  {formatCurrencyMinor(income.amountMinor, income.currencyCode)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {incomesQuery.hasNextPage && (
        <div className='mt-4 flex justify-center'>
          <Button
            disabled={incomesQuery.isFetchingNextPage}
            size='sm'
            variant='outline'
            onClick={() => {
              void incomesQuery.fetchNextPage()
            }}>
            {incomesQuery.isFetchingNextPage
              ? t('expenses.loadingMore')
              : t('expenses.loadMore')}
          </Button>
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
    </div>
  )
}
