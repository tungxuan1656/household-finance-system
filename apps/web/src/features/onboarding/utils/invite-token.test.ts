import { describe, expect, it } from 'vitest'

import { normalizeInviteToken } from '@/features/onboarding/utils/invite-token'

describe('normalizeInviteToken', () => {
  it('returns trimmed token value', () => {
    expect(normalizeInviteToken('  invite-token-123  ')).toBe(
      'invite-token-123',
    )
  })

  it('extracts token from invitation path', () => {
    expect(
      normalizeInviteToken(
        'https://app.example.com/invitations/invite-token-123?source=email',
      ),
    ).toBe('invite-token-123')
  })

  it('returns empty string for blank values', () => {
    expect(normalizeInviteToken('   ')).toBe('')
  })
})
