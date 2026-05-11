'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
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
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useHouseholdMembersQuery } from '@/hooks/api/use-households'
import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

const getHouseholdRoleLabel = (role: HouseholdDTO['role']) => {
  if (role === 'admin') {
    return t('app.householdDetail.members.invite.fields.role.options.admin')
  }

  return t('app.householdDetail.members.invite.fields.role.options.member')
}

const getHouseholdVisibilityLabel = (
  visibility: HouseholdDTO['defaultVisibility'],
) =>
  t(
    `app.householdDetail.fields.defaultVisibility.options.${visibility}` as const,
  )

const getCurrentPeriod = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

const getLocale = () =>
  typeof navigator !== 'undefined' && navigator.language
    ? navigator.language
    : 'vi-VN'

const formatCurrency = (amountMinor: number, currencyCode: string) =>
  new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMinor / 100)

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
  const budgetQuery = useBudgetListQuery(household.id)
  const memberQuery = useHouseholdMembersQuery(household.id)
  const hasBudget = (budgetQuery.data?.items.length ?? 0) > 0

  return (
    <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <CardTitle>{household.name}</CardTitle>
            <CardDescription className='flex flex-wrap gap-x-2 gap-y-1 text-xs'>
              <span>{household.defaultCurrencyCode}</span>
              <span aria-hidden='true'>·</span>
              <span>{household.timezone}</span>
              {memberQuery.data ? (
                <>
                  <span aria-hidden='true'>·</span>
                  <span>
                    {t('app.householdDetail.memberCount', {
                      count: memberQuery.data.items.length,
                    })}
                  </span>
                </>
              ) : null}
            </CardDescription>
          </div>
          <Badge variant='secondary'>
            {getHouseholdRoleLabel(household.role)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <p className='text-sm text-muted-foreground'>
          {getHouseholdVisibilityLabel(household.defaultVisibility)}
        </p>
        {budgetQuery.data ? (
          <p className='text-sm text-muted-foreground'>
            {t('groups.card.budgetLabel')} ·{' '}
            {hasBudget
              ? t('groups.card.statusActive')
              : t('groups.card.noBudget')}
          </p>
        ) : null}
        {analyticsQuery.data ? (
          <p className='text-sm font-medium text-foreground'>
            {t('groups.card.spentLabel')} ·{' '}
            {formatCurrency(
              analyticsQuery.data.totalSpendMinor,
              analyticsQuery.data.currencyCode,
            )}{' '}
            · {analyticsQuery.data.expenseCount} {t('groups.summary.expenses')}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className='justify-end'>
        <Button asChild size='xl' variant='outline'>
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
