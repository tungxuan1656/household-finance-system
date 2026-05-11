'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useExpenseSummaryQuery } from '@/hooks/api/use-expense'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { useAuthStore } from '@/stores/auth.store'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import { OverviewBudgetCard } from '@/views/app/overview/overview-budget-card'
import { getCurrentPeriod } from '@/views/app/overview/overview-formatters'
import { OverviewHeader } from '@/views/app/overview/overview-header'
import { OverviewHouseholdsSection } from '@/views/app/overview/overview-households-section'
import { OverviewNextStepsCard } from '@/views/app/overview/overview-next-steps-card'
import { OverviewSummarySection } from '@/views/app/overview/overview-summary-section'

function OverviewPage() {
  const user = useAuthStore.use.user()
  const households = useHouseholdStore.use.households()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const isHouseholdLoading = useHouseholdStore.use.isLoading()
  const period = getCurrentPeriod()
  const [isInitialHouseholdLoad, setIsInitialHouseholdLoad] = useState(true)

  const shouldLoadHouseholds = households.length === 0 && !currentHousehold

  useEffect(() => {
    let isMounted = true

    if (!shouldLoadHouseholds) {
      setIsInitialHouseholdLoad(false)

      return () => {
        isMounted = false
      }
    }

    void householdActions.fetchHouseholds().finally(() => {
      if (isMounted) {
        setIsInitialHouseholdLoad(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [shouldLoadHouseholds])

  const expenseSummaryQuery = useExpenseSummaryQuery()
  const budgetSummaryQuery = useBudgetListQuery(currentHousehold?.id)

  const showInitialHouseholdLoading =
    isInitialHouseholdLoad && isHouseholdLoading && households.length === 0
  const showEmptyState = !showInitialHouseholdLoading && households.length === 0
  const canInviteMembers = households.some(
    (household) => household.role === 'admin',
  )

  return (
    <div className='space-y-6'>
      <OverviewHeader name={user?.displayName} period={period} />

      {showInitialHouseholdLoading ? (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardContent className='pt-6'>
                <Skeleton className='h-10 w-32' />
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <Skeleton className='h-10 w-20' />
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <Skeleton className='h-10 w-20' />
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardContent className='space-y-2 pt-6'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-20' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : showEmptyState ? (
        <Empty className='border bg-card'>
          <EmptyHeader>
            <EmptyTitle>{t('app.overview.empty.title')}</EmptyTitle>
            <EmptyDescription>
              {t('app.overview.empty.description')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild className='w-full sm:w-auto'>
              <Link href={PATHS.ONBOARDING}>
                {t('app.overview.empty.createHousehold')}
              </Link>
            </Button>
            <Button asChild className='w-full sm:w-auto' variant='outline'>
              <Link href={PATHS.ONBOARDING}>
                {t('app.overview.empty.joinHousehold')}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className='space-y-6'>
          <OverviewSummarySection
            canInviteMembers={canInviteMembers}
            expenseSummaryQuery={expenseSummaryQuery}
            householdCount={households.length}
          />

          <OverviewHouseholdsSection households={households} />

          <section className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
            <OverviewBudgetCard
              budgetSummaryQuery={budgetSummaryQuery}
              hasCurrentHousehold={Boolean(currentHousehold)}
            />

            <OverviewNextStepsCard />
          </section>
        </div>
      )}
    </div>
  )
}

export { OverviewPage }
