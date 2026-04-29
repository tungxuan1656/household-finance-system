import { describe, expect, it } from 'vitest'

import {
  createInvitationRequestSchema,
  invitationTokenPathParamsSchema,
} from '@/contracts/invitation'

describe('invitation contracts', () => {
  it('applies defaults for create invitation request', () => {
    const schema = createInvitationRequestSchema('vi')
    const parsed = schema.parse({})

    expect(parsed).toEqual({
      role: 'member',
      ttlHours: 72,
    })
  })

  it('accepts allowed ttl presets', () => {
    const schema = createInvitationRequestSchema('vi')

    expect(schema.parse({ role: 'member', ttlHours: 24 }).ttlHours).toBe(24)
    expect(schema.parse({ role: 'admin', ttlHours: 72 }).ttlHours).toBe(72)
    expect(schema.parse({ role: 'member', ttlHours: 168 }).ttlHours).toBe(168)
  })

  it('rejects unsupported ttl values', () => {
    const schema = createInvitationRequestSchema('vi')
    const parsed = schema.safeParse({ role: 'member', ttlHours: 2 })

    expect(parsed.success).toBe(false)
  })

  it('rejects blank token', () => {
    const schema = invitationTokenPathParamsSchema('vi')
    const parsed = schema.safeParse({ token: '   ' })

    expect(parsed.success).toBe(false)
  })
})
