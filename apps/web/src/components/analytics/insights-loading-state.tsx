'use client'

import { Skeleton } from '@/components/ui/skeleton'

function InsightsLoadingState() {
  return (
    <div className='flex flex-col gap-6' data-testid='insights-loading'>
      <div className='flex items-end justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-72' />
        </div>
        <Skeleton className='h-8 w-32' />
      </div>
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
      <Skeleton className='h-72 rounded-xl' />
    </div>
  )
}

export { InsightsLoadingState }
