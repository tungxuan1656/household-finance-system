import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'primary'
  | 'secondary'

export type ButtonSize = 'icon' | 'md' | 'sm'

export const buttonVariants = ({
  className,
  size = 'md',
  variant = 'primary',
}: {
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
} = {}) =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-[18px] font-bold transition duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-60',
    size === 'sm' && 'min-h-9 px-3 text-xs',
    size === 'md' && 'min-h-11 px-4 text-sm',
    size === 'icon' && 'size-10 rounded-2xl p-0',
    variant === 'primary' &&
      'bg-tma-text-strong text-white shadow-[0_10px_22px_rgba(17,24,39,0.14)]',
    variant === 'secondary' &&
      'bg-tma-warning text-[#5b4100] shadow-[0_10px_18px_rgba(247,196,0,0.22)]',
    variant === 'outline' &&
      'border border-tma-line bg-white/70 text-tma-text-strong shadow-tma-soft',
    variant === 'ghost' && 'bg-black/5 text-tma-text-strong',
    variant === 'danger' && 'bg-[#d93838] text-white',
    className,
  )

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

export const Button = ({
  children,
  className,
  size,
  type = 'button',
  variant,
  ...props
}: ButtonProps) => (
  <button
    className={buttonVariants({ className, size, variant })}
    type={type}
    {...props}>
    {children}
  </button>
)
