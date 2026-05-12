import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { surfaceVariants } from '@/components/ui/primitive-styles'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'group/card flex flex-col overflow-hidden border text-sm text-card-foreground has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
      },
      size: {
        sm: 'gap-4 rounded-xl py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
        default: 'gap-6 rounded-2xl py-5',
      },
      surface: {
        glass: surfaceVariants({ surface: 'glass' }),
        subtle: surfaceVariants({ surface: 'subtle' }),
        outline: surfaceVariants({ surface: 'outline' }),
        solid: surfaceVariants({ surface: 'solid' }),
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      surface: 'glass',
    },
  },
)

function Card({
  className,
  variant = 'default',
  size = 'default',
  surface = 'glass',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return (
    <div
      className={cn(cardVariants({ variant, size, surface }), className)}
      data-size={size}
      data-slot='card'
      data-surface={surface}
      data-variant={variant}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-2 rounded-t-xl px-5 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
        className,
      )}
      data-slot='card-header'
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('font-heading text-base font-medium', className)}
      data-slot='card-title'
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-sm text-muted-foreground', className)}
      data-slot='card-description'
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      data-slot='card-action'
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-5 group-data-[size=sm]/card:px-4', className)}
      data-slot='card-content'
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center rounded-b-xl px-5 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4',
        className,
      )}
      data-slot='card-footer'
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
