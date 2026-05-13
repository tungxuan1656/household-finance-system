'use client'

import { Progress as ProgressPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

const progressToneClasses = {
  default: 'bg-primary',
  warning: 'bg-status-warning',
  danger: 'bg-destructive',
} as const

function Progress({
  className,
  value,
  tone,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: 'default' | 'warning' | 'danger'
}) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'relative flex h-3 w-full items-center overflow-x-hidden rounded-full bg-muted',
        className,
      )}
      data-slot='progress'
      {...props}>
      <ProgressPrimitive.Indicator
        className={cn(
          'size-full flex-1 transition-all',
          progressToneClasses[tone ?? 'default'],
        )}
        data-slot='progress-indicator'
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
