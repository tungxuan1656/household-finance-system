'use client'

import { User2Icon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useHouseholdMembersQuery } from '@/hooks/api/use-households'
import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'
import { formatCurrency } from '@/utils/currency/format'
import { getHouseholdRoleLabel } from '@/utils/household/labels'

import { Badge } from '../ui/badge'

const getCurrentPeriod = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

type HouseholdSummaryCardProps = {
  household: HouseholdDTO
}

export const HouseholdSummaryCard = ({
  household,
}: HouseholdSummaryCardProps) => {
  const analyticsQuery = useAnalyticsOverviewQuery(
    {
      household_id: household.id,
      period: getCurrentPeriod(),
    },
    {
      enabled: true,
    },
  )
  const memberQuery = useHouseholdMembersQuery(household.id)

  return (
    <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
      <CardHeader>
        <CardTitle className='uppercase'>{household.name}</CardTitle>
        <CardDescription className='flex flex-wrap items-center gap-2 text-sm'>
          <Badge variant='secondary'>
            {getHouseholdRoleLabel(household.role)}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {analyticsQuery.data ? (
          <p className='space-x-2'>
            <span className='font-mono text-2xl text-foreground'>
              {formatCurrency(
                analyticsQuery.data.totalSpendMinor,
                analyticsQuery.data.currencyCode,
              )}
            </span>
            <span className='font-medium text-muted-foreground'>
              {' / '}
              {analyticsQuery.data.expenseCount} {t('groups.summary.expenses')}
            </span>
          </p>
        ) : null}
      </CardContent>
      <CardFooter className='items-center justify-between'>
        {memberQuery.data ? (
          <span className='flex items-center gap-2 font-mono'>
            <User2Icon className='size-4' />
            {t('app.householdDetail.memberCount', {
              count: memberQuery.data.items.length,
            })}
          </span>
        ) : null}
        <Button asChild size='sm' variant='outline'>
          <Link href={`/households/${household.id}`}>
            {t('app.households.actions.viewDetail')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
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
        <CardFooter className='justify-end'>
          <Skeleton className='h-9 w-28' />
        </CardFooter>
      </Card>
    ))}
  </div>
)
