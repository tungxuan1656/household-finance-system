import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { surfaceVariants } from '@/components/ui/primitive-styles'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      tone: {
        neutral: 'text-card-foreground',
        info: 'text-primary',
        success: 'text-status-success-foreground',
        warning: 'text-status-warning-foreground',
        destructive:
          'text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
      },
      surface: {
        glass: surfaceVariants({ surface: 'glass' }),
        subtle: surfaceVariants({ surface: 'subtle' }),
        outline: surfaceVariants({ surface: 'outline' }),
        solid: surfaceVariants({ surface: 'solid' }),
      },
    },
    defaultVariants: {
      tone: 'neutral',
      surface: 'glass',
    },
  },
)

function Alert({
  className,
  variant,
  tone,
  surface,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    variant?: 'default' | 'destructive'
  }) {
  const resolvedTone =
    tone ?? (variant === 'destructive' ? 'destructive' : 'neutral')

  return (
    <div
      className={cn(alertVariants({ tone: resolvedTone, surface }), className)}
      data-slot='alert'
      data-tone={resolvedTone}
      role='alert'
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
        className,
      )}
      data-slot='alert-title'
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
        className,
      )}
      data-slot='alert-description'
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('absolute top-2.5 right-3', className)}
      data-slot='alert-action'
      {...props}
    />
  )
}

export { Alert, AlertAction, AlertDescription, AlertTitle }
