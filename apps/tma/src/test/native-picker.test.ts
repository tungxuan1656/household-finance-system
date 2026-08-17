import { describe, expect, it } from 'vitest'

import { shouldActivateNativeControl } from '@/components/shared/native-picker'

describe('shouldActivateNativeControl', () => {
  it('allows enabled native controls to own activation', () => {
    expect(shouldActivateNativeControl(false)).toBe(true)
  })

  it('blocks disabled native controls', () => {
    expect(shouldActivateNativeControl(true)).toBe(false)
  })
})
