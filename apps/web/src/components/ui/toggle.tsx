'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-3xl font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-muted data-[state=on]:bg-muted data-[state=on]:text-foreground',
        outline:
          'border border-input bg-transparent hover:bg-muted data-[state=on]:bg-muted data-[state=on]:text-foreground',
        pill: 'bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
      },
      size: {
        default:
          'h-11 min-w-11 px-3 text-base has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 sm:h-9 sm:min-w-9 sm:text-sm',
        sm: 'h-9 min-w-9 px-3 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 sm:h-8 sm:min-w-8 sm:text-xs',
        lg: 'h-12 min-w-12 px-4 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 sm:h-10 sm:min-w-10 sm:text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ variant, size, className }))}
      data-slot='toggle'
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
