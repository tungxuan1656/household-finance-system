import { describe, expect, it, vi } from 'vitest'

import {
  activateButton,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  buttonVariants,
} from '@/components/ui/button'

type ButtonEvent = Parameters<NonNullable<ButtonProps['onClick']>>[0]

const event = {} as ButtonEvent

describe('Button activation contract', () => {
  it('triggers one light impact before one handler for enabled activation', () => {
    const calls: string[] = []
    const onClick = vi.fn(() => calls.push('handler'))
    const onImpact = vi.fn((style: 'light') => calls.push(style))

    activateButton(event, {
      onClick,
      onImpact,
    })

    expect(calls).toEqual(['light', 'handler'])
    expect(onImpact).toHaveBeenCalledWith('light')
    expect(onImpact).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not trigger a handler or haptic for disabled activation', () => {
    const onClick = vi.fn()
    const onImpact = vi.fn()

    activateButton(event, { disabled: true, onClick, onImpact })

    expect(onClick).not.toHaveBeenCalled()
    expect(onImpact).not.toHaveBeenCalled()
  })

  it('does not trigger a handler or haptic for aria-busy activation', () => {
    const onClick = vi.fn()
    const onImpact = vi.fn()

    activateButton(event, {
      'aria-busy': true,
      onClick,
      onImpact,
    })

    expect(onClick).not.toHaveBeenCalled()
    expect(onImpact).not.toHaveBeenCalled()
  })

  it('does not trigger haptic feedback without a handler', () => {
    const onImpact = vi.fn()

    activateButton(event, { onImpact })

    expect(onImpact).not.toHaveBeenCalled()
  })

  it('retains the public variant and size contract', () => {
    const variants: ButtonVariant[] = [
      'danger',
      'ghost',
      'outline',
      'primary',
      'secondary',
    ]
    const sizes: ButtonSize[] = ['icon', 'md', 'sm']
    const props = {
      children: 'Save',
      size: 'sm',
      variant: 'secondary',
    } satisfies ButtonProps

    expect(props).toMatchObject({ size: 'sm', variant: 'secondary' })

    expect(
      variants.every((variant) =>
        sizes.every((size) => buttonVariants({ size, variant })),
      ),
    ).toBe(true)
  })
})
