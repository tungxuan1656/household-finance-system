import { describe, expect, it } from 'vitest'

import { createUpdateProfileRequestSchema } from '@/contracts'

describe('profile contract schema', () => {
  it('rejects an empty payload', () => {
    const parsed = createUpdateProfileRequestSchema().safeParse({})

    expect(parsed.success).toBe(false)
  })

  it('rejects a blank trimmed display name', () => {
    const parsed = createUpdateProfileRequestSchema().safeParse({
      displayName: '   ',
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(
        'Tên hiển thị không được để trống.',
      )
    }
  })

  it('rejects an invalid avatar URL', () => {
    const parsed = createUpdateProfileRequestSchema().safeParse({
      avatarUrl: 'not-a-url',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects display name longer than 100 characters', () => {
    const parsed = createUpdateProfileRequestSchema().safeParse({
      displayName: 'a'.repeat(101),
    })

    expect(parsed.success).toBe(false)
  })

  it('accepts quick-add last source key when provided', () => {
    const parsed = createUpdateProfileRequestSchema().safeParse({
      quickAddLastSourceKey: 'cash',
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects quick-add last source key outside known source keys', () => {
    const parsed = createUpdateProfileRequestSchema().safeParse({
      quickAddLastSourceKey: 'wire',
    })

    expect(parsed.success).toBe(false)
  })
})
