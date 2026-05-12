'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/views/app/overview/overview-formatters'

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
        <div className='rounded-xl border bg-card p-4'>
          {/* Title line */}
          <div className='flex items-baseline gap-1'>
            <span className='text-sm font-semibold'>{household.name}</span>
            <span className='text-xs text-muted-foreground'>
              ({household.memberCount} members)
            </span>
          </div>

          {/* Stats */}
          <div className='mt-2 space-y-1 text-sm'>
            <p>
              <span className='text-muted-foreground'>Total spend: </span>
              <span className='font-medium tabular-nums'>
                {formatCurrency(
                  household.totalSpendMinor,
                  household.currencyCode,
                )}
              </span>
            </p>
            {household.yourContributionMinor !== undefined && (
              <p>
                <span className='text-muted-foreground'>
                  Your contribution:{' '}
                </span>
                <span className='font-medium tabular-nums'>
                  {formatCurrency(
                    household.yourContributionMinor,
                    household.currencyCode,
                  )}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <div className='rounded-xl border bg-card p-4'>
      <div className='space-y-2'>
        <div className='flex items-baseline gap-1'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-20' />
        </div>
        <div className='space-y-1'>
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-36' />
        </div>
      </div>
    </div>
  )
}

export type { HouseholdCardsSectionProps, HouseholdInfo }
export { HouseholdCardsSection }
