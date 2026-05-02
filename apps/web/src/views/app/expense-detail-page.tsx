'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ApiClientError } from '@/api/client'
import { ExpenseDetailCard } from '@/components/expense/expense-detail-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenseDetailQuery } from '@/hooks/api/use-expense'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

function ExpenseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const { data: expense, isLoading, error } = useExpenseDetailQuery(id)

  if (!id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <span aria-hidden='true'>✕</span>
          </EmptyMedia>
          <EmptyTitle>{t('expense.detail.notFound')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant='outline'>
            <Link href={PATHS.EXPENSES}>
              {t('common.actions.backToOverview')}
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <header className='flex flex-col gap-1'>
          <Skeleton className='h-7 w-48' />
        </header>
        <Card>
          <CardContent className='flex flex-col gap-4 pt-6'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-40' />
          </CardContent>
        </Card>
      </div>
    )
  }

  // 403 Forbidden — user cannot see this expense
  if (error && error instanceof ApiClientError && error.status === 403) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <span aria-hidden='true'>🔒</span>
          </EmptyMedia>
          <EmptyTitle>{t('expense.detail.forbidden')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant='outline'>
            <Link href={PATHS.EXPENSES}>
              {t('common.actions.backToOverview')}
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  // 404 Not Found
  if (error && error instanceof ApiClientError && error.status === 404) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <span aria-hidden='true'>✕</span>
          </EmptyMedia>
          <EmptyTitle>{t('expense.detail.notFound')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant='outline'>
            <Link href={PATHS.EXPENSES}>
              {t('common.actions.backToOverview')}
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  // Other errors (server, network, etc.)
  if (error || !expense) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <span aria-hidden='true'>⚠</span>
          </EmptyMedia>
          <EmptyTitle>{t('expense.feed.error')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant='outline'>
            <Link href={PATHS.EXPENSES}>
              {t('common.actions.backToOverview')}
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex items-center gap-3'>
        <Button variant='outline' onClick={() => router.back()}>
          {t('app.householdDetail.actions.back')}
        </Button>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('expense.detail.title')}
        </h1>
      </header>

      <ExpenseDetailCard expense={expense} />
    </div>
  )
}

export { ExpenseDetailPage }
