import { describe, expect, it } from 'vitest'

import { mergeSafeAreaInsets } from '@/lib/telegram/safe-area'

describe('mergeSafeAreaInsets', () => {
  it('uses the largest inset on each edge', () => {
    expect(
      mergeSafeAreaInsets(
        { top: 0, right: 0, bottom: 34, left: 0 },
        { top: 59, right: 0, bottom: 21, left: 0 },
      ),
    ).toEqual({
      top: 59,
      right: 0,
      bottom: 34,
      left: 0,
    })
  })
})
