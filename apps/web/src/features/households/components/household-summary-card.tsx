'use client'

import { User2Icon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useHouseholdMembersQuery } from '@/features/households/hooks/use-households'
import type { HouseholdDTO } from '@/features/households/types/household'
import { getHouseholdRoleLabel } from '@/features/households/utils/labels'
import { useAnalyticsOverviewQuery } from '@/features/insights/api/use-analytics'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'

const getCurrentPeriod = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

type HouseholdSummaryCardProps = { household: HouseholdDTO }

export const HouseholdSummaryCard = ({
  household,
}: HouseholdSummaryCardProps) => {
  const analyticsQuery = useAnalyticsOverviewQuery(
    { household_id: household.id, period: getCurrentPeriod() },
    { enabled: true },
  )
  const memberQuery = useHouseholdMembersQuery(household.id)

  return (
    <Link
      className='block rounded-2xl transition-all hover:shadow-md active:scale-[0.99]'
      href={`/households/${household.id}`}>
      <Card className='h-full cursor-pointer'>
        <CardHeader>
          <div className='flex min-w-0 flex-col gap-1'>
            <CardTitle className='truncate text-lg font-semibold'>
              {household.name}
            </CardTitle>
            <div className='flex items-center gap-2'>
              {memberQuery.data ? (
                <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <User2Icon className='size-3' />
                  {memberQuery.data.items.length}
                </span>
              ) : null}
              <Badge variant='secondary'>
                {getHouseholdRoleLabel(household.role)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-1'>
          {analyticsQuery.data ? (
            <>
              <span className='font-mono text-3xl font-bold tracking-tight text-foreground'>
                {formatCurrency(
                  analyticsQuery.data.totalSpendMinor,
                  analyticsQuery.data.currencyCode,
                )}
              </span>
              <span className='text-sm font-medium text-muted-foreground'>
                {analyticsQuery.data.expenseCount}{' '}
                {t('groups.summary.expenses')}
              </span>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

export const HouseholdsLoadingState = () => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3'>
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index}>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-1 flex-col gap-2'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-24' />
            </div>
            <Skeleton className='h-5 w-24 rounded-full' />
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-36' />
          <Skeleton className='h-4 w-28' />
        </CardContent>
        <CardFooter className='pt-0'>
          <Skeleton className='h-4 w-24' />
        </CardFooter>
      </Card>
    ))}
  </div>
)
