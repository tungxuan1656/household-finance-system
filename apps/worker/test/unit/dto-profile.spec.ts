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
})
