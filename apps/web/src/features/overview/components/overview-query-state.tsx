import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type OverviewQueryStateProps = {
  description: string
  isLoading?: boolean
  onRetry?: () => void
  retryLabel?: string
  title?: string
}

function OverviewQueryState({
  description,
  isLoading,
  onRetry,
  retryLabel,
  title,
}: OverviewQueryStateProps) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-24' />
      </div>
    )
  }

  return (
    <div className='space-y-3 rounded-xl border border-dashed p-4'>
      <div className='space-y-1'>
        {title ? <p className='font-medium'>{title}</p> : null}
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      {onRetry && retryLabel ? (
        <Button
          className='min-h-11'
          type='button'
          variant='outline'
          onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

export { OverviewQueryState }
