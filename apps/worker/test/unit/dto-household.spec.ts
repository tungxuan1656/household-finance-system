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

  it('accepts update payload with valid defaultVisibility "private"', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      defaultVisibility: 'private',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.defaultVisibility).toBe('private')
    }
  })

  it('accepts update payload with valid defaultVisibility "shared"', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      defaultVisibility: 'shared',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.defaultVisibility).toBe('shared')
    }
  })

  it('rejects update payload with invalid defaultVisibility value', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      defaultVisibility: 'public',
    })

    expect(parsed.success).toBe(false)
  })

  it('accepts update payload with all four settings fields at once', () => {
    const parsed = updateHouseholdRequestSchema().safeParse({
      name: 'Family Hub v2',
      defaultCurrencyCode: 'usd',
      timezone: 'UTC',
      defaultVisibility: 'shared',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.defaultCurrencyCode).toBe('USD')
      expect(parsed.data.timezone).toBe('UTC')
      expect(parsed.data.defaultVisibility).toBe('shared')
    }
  })
})
