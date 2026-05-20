'use client'

import { AlertTriangle, LockKeyhole, type LucideIcon, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
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
import { PageShell } from '@/components/ui/page-shell'
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

const BackToExpensesAction = () => (
  <Button asChild variant='outline'>
    <Link href={PATHS.EXPENSES}>{t('common.actions.backToOverview')}</Link>
  </Button>
)

type ExpenseDetailEmptyStateProps = {
  icon: LucideIcon
  title: string
}

const ExpenseDetailEmptyState = ({
  icon: Icon,
  title,
}: ExpenseDetailEmptyStateProps) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant='icon'>
        <Icon aria-hidden='true' className={EMPTY_STATE_ICON} />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
    </EmptyHeader>
    <EmptyContent>
      <BackToExpensesAction />
    </EmptyContent>
  </Empty>
)

const ExpenseDetailLoadingState = () => (
  <Card>
    <CardContent className='flex flex-col gap-4 pt-6'>
      <Skeleton className='h-5 w-32' />
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-20' />
      <Skeleton className='h-4 w-40' />
    </CardContent>
  </Card>
)

const isExpenseStatusError = (error: unknown, status: number): boolean =>
  error instanceof ApiClientError && error.status === status

export const ExpenseDetailPage = () => {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const { data: currentUser } = useCurrentUserProfileQuery()
  const { data: households } = useHouseholdsQuery()
  const deleteExpense = useDeleteExpenseMutation()
  const { data: expense, isLoading, error } = useExpenseDetailQuery(id)
  const isAdmin =
    expense?.householdId != null &&
    (households?.items.some(
      (household) =>
        household.id === expense.householdId && household.role === 'admin',
    ) ??
      false)
  const handleDelete = () => {
    if (!expense) return

    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        toast.success(t('expense.deleteSuccess'))
        router.push(PATHS.EXPENSES)
      },
      onError: () => {
        toast.error(t('expense.deleteError'))
      },
    })
  }

  const detailActions = expense ? (
    <ExpenseDetailActions
      currentUserId={currentUser?.id}
      expense={expense}
      isAdmin={isAdmin}
      isDeleting={deleteExpense.isPending}
      onDelete={handleDelete}
      onEdit={() => router.push(PATHS.EDIT_EXPENSE.replace('[id]', expense.id))}
    />
  ) : null

  let content: ReactNode

  if (!id) {
    content = (
      <ExpenseDetailEmptyState icon={X} title={t('expense.detail.notFound')} />
    )
  } else if (isLoading) {
    content = <ExpenseDetailLoadingState />
  } else if (isExpenseStatusError(error, 403)) {
    content = (
      <ExpenseDetailEmptyState
        icon={LockKeyhole}
        title={t('expense.detail.forbidden')}
      />
    )
  } else if (isExpenseStatusError(error, 404)) {
    content = (
      <ExpenseDetailEmptyState icon={X} title={t('expense.detail.notFound')} />
    )
  } else if (error || !expense) {
    content = (
      <ExpenseDetailEmptyState
        icon={AlertTriangle}
        title={t('expense.feed.error')}
      />
    )
  } else {
    content = (
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Button
            className='hidden sm:inline-flex'
            type='button'
            variant='outline'
            onClick={() => router.back()}>
            {t('app.householdDetail.actions.back')}
          </Button>
          {detailActions}
        </div>
        <ExpenseDetailCard expense={expense} />
      </div>
    )
  }

  return (
    <PageShell
      showBack
      title={t('expense.detail.title')}
      onBack={() => router.back()}>
      {content}
    </PageShell>
  )
}
