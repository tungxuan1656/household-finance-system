import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'primary'
  | 'secondary'

export type ButtonSize = 'icon' | 'md' | 'sm'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none aria-busy:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_8px_18px_color-mix(in_oklch,var(--primary),transparent_82%)] hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border-border bg-background text-foreground shadow-sm hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        danger:
          'text-destructive-foreground bg-destructive hover:bg-destructive/90',
      },
      size: {
        md: 'min-h-11 px-4 text-sm',
        sm: 'min-h-9 px-3 text-xs',
        icon: 'size-10 rounded-2xl p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

type ButtonActivationOptions = Pick<
  ButtonProps,
  'aria-busy' | 'disabled' | 'onClick'
> & {
  onImpact: (style: 'light') => void
}

export const activateButton = (
  event: Parameters<NonNullable<ButtonProps['onClick']>>[0],
  {
    'aria-busy': ariaBusy,
    disabled = false,
    onClick,
    onImpact,
  }: ButtonActivationOptions,
) => {
  const isBusy = ariaBusy === true || ariaBusy === 'true'

  if (disabled || isBusy || !onClick) return

  onImpact('light')
  onClick(event)
}

export const Button = ({
  children,
  className,
  'aria-busy': ariaBusy,
  disabled = false,
  onClick,
  size,
  type = 'button',
  variant,
  ...props
}: ButtonProps) => {
  const isBusy = ariaBusy === true || ariaBusy === 'true'
  const isInactive = disabled || isBusy

  return (
    <ButtonPrimitive
      aria-busy={ariaBusy}
      className={cn(buttonVariants({ className, size, variant }))}
      disabled={isInactive}
      type={type}
      onClick={(event) =>
        activateButton(event, {
          'aria-busy': ariaBusy,
          disabled: isInactive,
          onClick,
          onImpact: impact,
        })
      }
      {...props}>
      {children}
    </ButtonPrimitive>
  )
}

export { buttonVariants }
