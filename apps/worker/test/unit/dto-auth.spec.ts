import { describe, expect, it } from 'vitest'

import {
  exchangeProviderRequestSchema,
  refreshSessionRequestSchema,
} from '@/contracts'

describe('auth contract schemas', () => {
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

  it('rejects exchange payload with non-firebase provider', () => {
    const parsed = exchangeProviderRequestSchema.safeParse({
      provider: 'google',
      idToken: 'firebase-id-token',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects exchange payload with empty id token', () => {
    const parsed = exchangeProviderRequestSchema.safeParse({
      provider: 'firebase',
      idToken: '',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects refresh payload with empty refresh token', () => {
    const parsed = refreshSessionRequestSchema.safeParse({
      refreshToken: '',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects unknown fields in exchange payload', () => {
    const parsed = exchangeProviderRequestSchema.safeParse({
      provider: 'firebase',
      idToken: 'firebase-id-token',
      extra: 'unexpected',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects unknown fields in refresh payload', () => {
    const parsed = refreshSessionRequestSchema.safeParse({
      refreshToken: 'refresh-token',
      extra: 'unexpected',
    })

    expect(parsed.success).toBe(false)
  })
})
