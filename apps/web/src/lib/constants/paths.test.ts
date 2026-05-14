import { describe, expect, it } from 'vitest'

import { getHouseholdHref, PATHS } from '@/lib/constants/paths'

describe('paths', () => {
  it('builds a household href from the base path', () => {
    expect(getHouseholdHref('household-1')).toBe(
      `${PATHS.HOUSEHOLDS}/household-1`,
    )
  })
})
