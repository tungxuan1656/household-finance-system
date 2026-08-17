import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const Card = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) => (
  <section
    className={cn(
      'group/card flex flex-col gap-4 overflow-hidden rounded-[24px] border border-border/70 bg-card p-4 text-sm text-card-foreground shadow-[0_10px_28px_color-mix(in_oklch,var(--foreground),transparent_94%)]',
      className,
    )}
    data-slot='card'
    {...props}>
    {children}
  </section>
)

export const CardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div
    className={cn('grid gap-1', className)}
    data-slot='card-header'
    {...props}>
    {children}
  </div>
)

export const CardTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) => (
  <h2
    className={cn(
      'm-0 text-base leading-tight font-semibold text-card-foreground',
      className,
    )}
    data-slot='card-title'
    {...props}>
    {children}
  </h2>
)

export const CardDescription = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) => (
  <p
    className={cn(
      'm-0 text-sm leading-normal text-muted-foreground',
      className,
    )}
    data-slot='card-description'
    {...props}>
    {children}
  </p>
)

export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div
    className={cn('grid gap-3', className)}
    data-slot='card-content'
    {...props}>
    {children}
  </div>
)
