import { describe, expect, it } from 'vitest'

import {
  referenceCategoryKeySchema,
  referenceCategoryKindSchema,
  referenceCategorySchema,
  referenceSourceKeySchema,
} from '@/contracts/reference-data'

describe('reference-data contract schema', () => {
  it('accepts known category kind values', () => {
    expect(referenceCategoryKindSchema.safeParse('expense').success).toBe(true)
    expect(referenceCategoryKindSchema.safeParse('income').success).toBe(true)
    expect(referenceCategoryKindSchema.safeParse('transfer').success).toBe(true)
  })

  it('rejects unknown category kind values', () => {
    expect(referenceCategoryKindSchema.safeParse('other').success).toBe(false)
  })

  it('accepts canonical category keys and rejects unknown keys', () => {
    expect(referenceCategoryKeySchema.safeParse('food').success).toBe(true)
    expect(referenceCategoryKeySchema.safeParse('other').success).toBe(true)
    expect(referenceCategoryKeySchema.safeParse('salary').success).toBe(false)
  })

  it('accepts canonical source keys and rejects unknown keys', () => {
    expect(referenceSourceKeySchema.safeParse('cash').success).toBe(true)
    expect(referenceSourceKeySchema.safeParse('e-wallet').success).toBe(true)
    expect(referenceSourceKeySchema.safeParse('crypto').success).toBe(false)
  })

  it('rejects malformed category DTO payload', () => {
    const parsed = referenceCategorySchema.safeParse({
      key: 'food',
      kind: 'expense',
      iconUrl: 'not-a-url',
      color: '',
      name: 'Food',
    })

    expect(parsed.success).toBe(false)
  })
})
