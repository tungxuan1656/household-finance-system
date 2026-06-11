import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const Card = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) => (
  <section
    className={cn(
      'rounded-3xl border border-white/70 bg-tma-card-bg p-4 shadow-tma-card',
      className,
    )}
    {...props}>
    {children}
  </section>
)

export const CardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div className={cn('mb-3 grid gap-1', className)} {...props}>
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
      'm-0 text-base leading-tight font-semibold text-tma-text-strong',
      className,
    )}
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
    className={cn('m-0 text-sm leading-normal text-tma-text-muted', className)}
    {...props}>
    {children}
  </p>
)

export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div className={cn('grid gap-3', className)} {...props}>
    {children}
  </div>
)
