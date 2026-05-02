'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ExpenseForm } from '@/components/expense/expense-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useHouseholdsQuery } from '@/hooks/api/use-households'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

function AddExpensePage() {
  const router = useRouter()

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useReferenceCategoriesQuery()
  const {
    data: householdsData,
    isLoading: isHouseholdsLoading,
    error: householdsError,
    refetch: refetchHouseholds,
  } = useHouseholdsQuery()

  const isLoading = isCategoriesLoading || isHouseholdsLoading
  const error = categoriesError || householdsError

  const categories = categoriesData?.items ?? []
  const households = householdsData?.items ?? []

  const handleRetry = () => {
    if (categoriesError) refetchCategories()
    if (householdsError) refetchHouseholds()
  }

  const handleSuccess = () => {
    toast.success(t('expense.success'))
    router.push(PATHS.EXPENSES)
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-col gap-1'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('expense.addTitle')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('app.placeholder.expenses.description')}
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-4'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && error ? (
        <Card>
          <CardContent className='flex items-center justify-between gap-2 pt-6'>
            <p className='text-sm text-destructive'>{t('expense.loadError')}</p>
            <Button type='button' variant='outline' onClick={handleRetry}>
              {t('app.householdDetail.actions.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error ? (
        <ExpenseForm
          categories={categories}
          households={households}
          onSuccess={handleSuccess}
        />
      ) : null}
    </div>
  )
}

export { AddExpensePage }
