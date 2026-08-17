import { Button as ButtonPrimitive } from '@base-ui/react/button'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const ChipButton = ({
  children,
  className,
  disabled = false,
  onClick,
  'aria-busy': ariaBusy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) => {
  const isBusy = ariaBusy === true || ariaBusy === 'true'
  const isInactive = disabled || isBusy

  return (
    <ButtonPrimitive
      aria-busy={ariaBusy}
      aria-pressed={false}
      className={cn(
        'group/chip inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-2xl border border-transparent bg-card p-2.5 text-left text-sm font-semibold text-card-foreground shadow-sm transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      disabled={isInactive}
      type='button'
      onClick={(event) => {
        if (isInactive) return

        selection()
        onClick?.(event)
      }}
      {...props}>
      {children}
    </ButtonPrimitive>
  )
}
