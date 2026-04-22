import { describe, expect, it } from 'vitest'

import { updateProfileRequestSchema } from '@/contracts'

describe('profile contract schema', () => {
  it('rejects an empty payload', () => {
    const parsed = updateProfileRequestSchema.safeParse({})

    expect(parsed.success).toBe(false)
  })

  it('rejects a blank trimmed display name', () => {
    const parsed = updateProfileRequestSchema.safeParse({
      displayName: '   ',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects an invalid avatar URL', () => {
    const parsed = updateProfileRequestSchema.safeParse({
      avatarUrl: 'not-a-url',
    })

    expect(parsed.success).toBe(false)
  })
})
