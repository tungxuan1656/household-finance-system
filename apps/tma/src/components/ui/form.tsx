import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

import { cn } from '@/lib/utils'

export const Field = ({
  children,
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) => (
  <label className={cn('grid gap-2', className)} {...props}>
    {children}
  </label>
)

export const FieldLabel = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <span
    className={cn(
      'text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase',
      className,
    )}>
    {children}
  </span>
)

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'min-h-12 w-full rounded-2xl border border-tma-line bg-white px-4 text-base font-medium text-tma-text-strong transition outline-none focus:border-tma-primary/30 focus:ring-4 focus:ring-tma-primary/10 disabled:opacity-70',
      className,
    )}
    {...props}
  />
)

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      'min-h-26 w-full resize-none rounded-2xl border border-tma-line bg-white p-4 text-sm leading-relaxed text-tma-text-strong transition outline-none focus:border-tma-primary/30 focus:ring-4 focus:ring-tma-primary/10 disabled:opacity-70',
      className,
    )}
    {...props}
  />
)

export const FieldError = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <p className={cn('m-0 text-xs font-semibold text-[#d14d7b]', className)}>
    {children}
  </p>
)
