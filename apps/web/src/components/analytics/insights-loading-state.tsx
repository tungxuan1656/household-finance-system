'use client'

import { Skeleton } from '@/components/ui/skeleton'

function InsightsLoadingState() {
  return (
    <div className='flex flex-col gap-6' data-testid='insights-loading'>
      <div className='grid gap-4 xl:grid-cols-3'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
      <div className='grid gap-4 xl:grid-cols-2'>
        <Skeleton className='h-72 rounded-xl' />
        <Skeleton className='h-72 rounded-xl' />
      </div>
      <Skeleton className='h-64 rounded-xl' />
    </div>
  )
}

export { InsightsLoadingState }
