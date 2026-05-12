'use client'

import { Progress as ProgressPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  tone = 'default',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?:
    | 'default'
    | 'warning'
    | 'danger'
    | 'success'
    | 'chart-1'
    | 'chart-2'
    | 'chart-3'
    | 'chart-4'
    | 'chart-5'
}) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'relative flex h-3 w-full items-center overflow-x-hidden rounded-full bg-muted',
        className,
      )}
      data-slot='progress'
      data-tone={tone}
      {...props}>
      <ProgressPrimitive.Indicator
        className={cn(
          'size-full flex-1 transition-all',
          tone === 'warning' && 'bg-warning',
          tone === 'danger' && 'bg-destructive',
          tone === 'success' && 'bg-emerald-500',
          tone === 'chart-1' && 'bg-chart-1',
          tone === 'chart-2' && 'bg-chart-2',
          tone === 'chart-3' && 'bg-chart-3',
          tone === 'chart-4' && 'bg-chart-4',
          tone === 'chart-5' && 'bg-chart-5',
          tone === 'default' && 'bg-primary',
        )}
        data-slot='progress-indicator'
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
