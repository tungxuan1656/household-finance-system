import { describe, expect, it } from 'vitest'

import {
  exchangeProviderRequestSchema,
  refreshSessionRequestSchema,
} from '@/dto'

describe('auth dto schemas', () => {
  it('accepts a valid exchange provider payload', () => {
    const parsed = exchangeProviderRequestSchema.safeParse({
      provider: 'firebase',
      idToken: 'firebase-id-token',
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects refresh session payload without refresh token', () => {
    const parsed = refreshSessionRequestSchema.safeParse({})

    expect(parsed.success).toBe(false)
  })
})
