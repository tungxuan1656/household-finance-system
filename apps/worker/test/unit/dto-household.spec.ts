import { describe, expect, it } from 'vitest'

import {
  createHouseholdRequestSchema,
  householdPathParamsSchema,
  updateHouseholdRequestSchema,
} from '@/contracts'

describe('household contract schema', () => {
  it('accepts valid create payload and defaults currency to VND', () => {
    const parsed = createHouseholdRequestSchema().safeParse({
      name: 'Family Hub',
    })

    expect(parsed.success).toBe(true)

    if (parsed.success) {
      expect(parsed.data.defaultCurrencyCode).toBe('VND')
    }
  })

  it('rejects blank household name', () => {
    const parsed = createHouseholdRequestSchema().safeParse({
      name: '   ',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects invalid currency code', () => {
    const parsed = createHouseholdRequestSchema().safeParse({
      name: 'Family Hub',
      defaultCurrencyCode: 'US',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects blank household id route param', () => {
    const parsed = householdPathParamsSchema().safeParse({
      id: '   ',
    })

    expect(parsed.success).toBe(false)
  })

  it('accepts valid update payload', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      defaultCurrencyCode: 'eur',
      name: 'Family Hub Updated',
      avatarUrl: 'https://cdn.example.com/household-avatar.jpg',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.defaultCurrencyCode).toBe('EUR')
      expect(parsed.data.avatarUrl).toBe(
        'https://cdn.example.com/household-avatar.jpg',
      )
    }
  })

  it('rejects empty update payload', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({})

    expect(parsed.success).toBe(false)
  })

  it('accepts update payload with valid IANA timezone', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      timezone: 'Asia/Ho_Chi_Minh',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.timezone).toBe('Asia/Ho_Chi_Minh')
    }
  })

  it('rejects update payload with invalid timezone string', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      timezone: 'Not/A_Real_Timezone',
    })

    expect(parsed.success).toBe(false)
  })

  it('accepts update payload with all supported settings fields at once', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      name: 'Family Hub v2',
      defaultCurrencyCode: 'usd',
      timezone: 'UTC',
      avatarUrl: null,
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.defaultCurrencyCode).toBe('USD')
      expect(parsed.data.timezone).toBe('UTC')
      expect(parsed.data.avatarUrl).toBeNull()
    }
  })

  it('rejects update payload with invalid avatar URL', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      avatarUrl: 'not-a-valid-url',
    })

    expect(parsed.success).toBe(false)
  })
})
