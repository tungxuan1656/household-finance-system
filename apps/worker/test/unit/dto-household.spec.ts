import { describe, expect, it } from 'vitest'

import {
  createHouseholdRequestSchema,
  householdPathParamsSchema,
  updateHouseholdRequestSchema,
} from '@/contracts'

describe('household contract schema', () => {
  it('accepts valid create payload and normalizes currency code', () => {
    const parsed = createHouseholdRequestSchema().safeParse({
      name: 'Family Hub',
      defaultCurrencyCode: 'usd',
    })

    expect(parsed.success).toBe(true)

    if (parsed.success) {
      expect(parsed.data.defaultCurrencyCode).toBe('USD')
    }
  })

  it('rejects blank household name', () => {
    const parsed = createHouseholdRequestSchema().safeParse({
      name: '   ',
      defaultCurrencyCode: 'USD',
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
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.defaultCurrencyCode).toBe('EUR')
    }
  })

  it('rejects empty update payload', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({})

    expect(parsed.success).toBe(false)
  })
})
