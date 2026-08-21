import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { impact } from '@/lib/telegram/haptics'

type GeneratedButtonProps = ComponentProps<typeof Button>
type ButtonClickEvent = Parameters<
  NonNullable<GeneratedButtonProps['onClick']>
>[0]

export type TmaHapticButtonProps = GeneratedButtonProps

export interface TmaHapticActivationOptions {
  ariaBusy?: boolean | 'true' | 'false'
  disabled?: boolean
  onClick?: (event: ButtonClickEvent) => void
  onImpact?: (style: 'light') => void
  type?: TmaHapticButtonProps['type']
}

export const runTmaHapticActivation = (
  event: ButtonClickEvent,
  {
    ariaBusy,
    disabled = false,
    onClick,
    onImpact = impact,
    type,
  }: TmaHapticActivationOptions,
): void => {
  const isBusy = ariaBusy === true || ariaBusy === 'true'

  if (disabled || isBusy || (!onClick && type !== 'submit')) return

  onImpact('light')
  onClick?.(event)
}

export const TmaHapticButton = ({
  'aria-busy': ariaBusy,
  disabled = false,
  onClick,
  type,
  ...props
}: TmaHapticButtonProps) => {
  const isBusy = ariaBusy === true || ariaBusy === 'true'
  const isInactive = disabled || isBusy

  return (
    <Button
      aria-busy={ariaBusy}
      disabled={isInactive}
      type={type}
      onClick={(event) =>
        runTmaHapticActivation(event, {
          ariaBusy,
          disabled: isInactive,
          onClick,
          type,
        })
      }
      {...props}
    />
  )
}
