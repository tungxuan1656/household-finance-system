import { describe, expect, it, vi } from 'vitest'

import type { TmaHapticButtonProps } from '@/components/shared/tma-haptic-button'
import { runTmaHapticActivation } from '@/components/shared/tma-haptic-button'

type ButtonClickEvent = Parameters<
  NonNullable<TmaHapticButtonProps['onClick']>
>[0]

describe('runTmaHapticActivation', () => {
  const event = {} as ButtonClickEvent

  it('fires one impact and one caller handler when enabled', () => {
    const onImpact = vi.fn()
    const onClick = vi.fn()

    runTmaHapticActivation(event, { onImpact, onClick })

    expect(onImpact).toHaveBeenCalledTimes(1)
    expect(onImpact).toHaveBeenCalledWith('light')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(event)
  })

  it.each([
    { label: 'disabled', disabled: true },
    { label: 'busy', ariaBusy: true },
    { label: 'string busy', ariaBusy: 'true' as const },
  ])('does nothing when $label', ({ disabled, ariaBusy }) => {
    const onImpact = vi.fn()
    const onClick = vi.fn()

    runTmaHapticActivation(event, { ariaBusy, disabled, onImpact, onClick })

    expect(onImpact).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not involve the Telegram seam without an activation handler', () => {
    const onImpact = vi.fn()

    runTmaHapticActivation(event, { onImpact })

    expect(onImpact).not.toHaveBeenCalled()
  })

  it('fires one impact for an enabled submit without a caller handler', () => {
    const onImpact = vi.fn()

    runTmaHapticActivation(event, { onImpact, type: 'submit' })

    expect(onImpact).toHaveBeenCalledTimes(1)
    expect(onImpact).toHaveBeenCalledWith('light')
  })

  it('fires one impact and one caller handler for an enabled submit', () => {
    const onImpact = vi.fn()
    const onClick = vi.fn()

    runTmaHapticActivation(event, { onClick, onImpact, type: 'submit' })

    expect(onImpact).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(event)
  })

  it.each([
    { label: 'disabled submit', disabled: true },
    { label: 'busy submit', ariaBusy: true },
    { label: 'string busy submit', ariaBusy: 'true' as const },
  ])('does not impact a $label without a caller handler', (options) => {
    const onImpact = vi.fn()

    runTmaHapticActivation(event, { ...options, onImpact, type: 'submit' })

    expect(onImpact).not.toHaveBeenCalled()
  })
})
