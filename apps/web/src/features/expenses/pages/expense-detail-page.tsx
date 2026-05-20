'use client'

import { AlertTriangle, LockKeyhole, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
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
import { ExpenseDetailActions } from '@/features/expenses/components/expense-detail-actions'
import { ExpenseDetailCard } from '@/features/expenses/components/expense-detail-card'
import {
  useDeleteExpenseMutation,
  useExpenseDetailQuery,
} from '@/features/expenses/hooks/use-expense'
import { useHouseholdsQuery } from '@/features/households/hooks/use-households'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

const EMPTY_STATE_ICON = 'size-5 text-muted-foreground'

const notFoundState = (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant='icon'>
        <X aria-hidden='true' className={EMPTY_STATE_ICON} />
      </EmptyMedia>
      <EmptyTitle>{t('expense.detail.notFound')}</EmptyTitle>
    </EmptyHeader>
    <EmptyContent>
      <Button asChild variant='outline'>
        <Link href={PATHS.EXPENSES}>{t('common.actions.backToOverview')}</Link>
      </Button>
    </EmptyContent>
  </Empty>
)

const forbiddenState = (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant='icon'>
        <LockKeyhole aria-hidden='true' className={EMPTY_STATE_ICON} />
      </EmptyMedia>
      <EmptyTitle>{t('expense.detail.forbidden')}</EmptyTitle>
    </EmptyHeader>
    <EmptyContent>
      <Button asChild variant='outline'>
        <Link href={PATHS.EXPENSES}>{t('common.actions.backToOverview')}</Link>
      </Button>
    </EmptyContent>
  </Empty>
)

const errorState = (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant='icon'>
        <AlertTriangle aria-hidden='true' className={EMPTY_STATE_ICON} />
      </EmptyMedia>
      <EmptyTitle>{t('expense.feed.error')}</EmptyTitle>
    </EmptyHeader>
    <EmptyContent>
      <Button asChild variant='outline'>
        <Link href={PATHS.EXPENSES}>{t('common.actions.backToOverview')}</Link>
      </Button>
    </EmptyContent>
  </Empty>
)

export function ExpenseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const { data: currentUser } = useCurrentUserProfileQuery()
  const { data: households } = useHouseholdsQuery()
  const deleteExpense = useDeleteExpenseMutation()
  const { data: expense, isLoading, error } = useExpenseDetailQuery(id)
  if (!id) return notFoundState
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
  if (error && error instanceof ApiClientError && error.status === 403)
    return forbiddenState
  if (error && error instanceof ApiClientError && error.status === 404)
    return notFoundState
  if (error || !expense) return errorState

  const isAdmin =
    expense.householdId != null &&
    (households?.items.some(
      (household) =>
        household.id === expense.householdId && household.role === 'admin',
    ) ??
      false)
  const handleDelete = () =>
    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        toast.success(t('expense.deleteSuccess'))
        router.push(PATHS.EXPENSES)
      },
      onError: () => {
        toast.error(t('expense.deleteError'))
      },
    })

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={() => router.back()}>
            {t('app.householdDetail.actions.back')}
          </Button>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('expense.detail.title')}
          </h1>
        </div>
        <ExpenseDetailActions
          currentUserId={currentUser?.id}
          expense={expense}
          isAdmin={isAdmin}
          isDeleting={deleteExpense.isPending}
          onDelete={handleDelete}
          onEdit={() => router.push(`/expenses/${expense.id}/edit`)}
        />
      </header>
      <ExpenseDetailCard expense={expense} />
    </div>
  )
}
