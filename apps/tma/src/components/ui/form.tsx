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
  <label
    className={cn('group/field grid gap-2', className)}
    data-slot='field'
    {...props}>
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
      'text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase',
      className,
    )}
    data-slot='field-label'>
    {children}
  </span>
)

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'min-h-12 w-full rounded-2xl border border-input bg-background px-4 text-base font-medium text-foreground transition outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-3 focus:ring-ring/30 disabled:opacity-60',
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
      'min-h-26 w-full resize-none rounded-3xl border border-input bg-background p-4 text-sm leading-relaxed text-foreground transition outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-3 focus:ring-ring/30 disabled:opacity-60',
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
  <p
    className={cn('m-0 text-xs font-semibold text-destructive', className)}
    data-slot='field-error'
    role='alert'>
    {children}
  </p>
)
