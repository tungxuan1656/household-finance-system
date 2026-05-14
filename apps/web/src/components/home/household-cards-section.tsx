'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'

type HouseholdInfo = {
  id: string
  name: string
  memberCount: number
  totalSpendMinor: number
  currencyCode: string
  yourContributionMinor?: number
}

type HouseholdCardsSectionProps = {
  household: HouseholdInfo | null
  isLoading: boolean
}

function HouseholdCardsSection({
  household,
  isLoading,
}: HouseholdCardsSectionProps) {
  // Hidden entirely when not in household lens
  if (!household && !isLoading) {
    return null
  }

  return (
    <section>
      {isLoading ? (
        <LoadingSkeleton />
      ) : household ? (
        <Card>
          <CardHeader>
            <CardTitle className='truncate'>{household.name}</CardTitle>
            <CardDescription>
              <Badge variant='secondary'>
                {household.memberCount}{' '}
                {t('app.overview.householdCard.members')}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2 text-sm'>
              <p>
                <span className='text-muted-foreground'>
                  {t('app.overview.householdCard.totalSpend')}{' '}
                </span>
                <span className='font-mono font-medium tabular-nums'>
                  {formatCurrency(
                    household.totalSpendMinor,
                    household.currencyCode,
                  )}
                </span>
              </p>
              {household.yourContributionMinor !== undefined && (
                <p>
                  <span className='text-muted-foreground'>
                    {t('app.overview.householdCard.yourContribution')}{' '}
                  </span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatCurrency(
                      household.yourContributionMinor,
                      household.currencyCode,
                    )}
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className='h-4 w-32' />
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex items-baseline gap-1'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-20' />
        </div>
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-36' />
        </div>
      </CardContent>
    </Card>
  )
}

export type { HouseholdCardsSectionProps, HouseholdInfo }
export { HouseholdCardsSection }
