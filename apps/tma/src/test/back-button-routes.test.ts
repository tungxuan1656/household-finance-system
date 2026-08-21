import { describe, expect, it } from 'vitest'

import {
  isInvitationAcceptPathname,
  isRootTabPathname,
} from '@/lib/constants/routes'

describe('BackButton route classification', () => {
  it('classifies both root tab screens as root tabs', () => {
    expect(isRootTabPathname('/')).toBe(true)
    expect(isRootTabPathname('/statistics')).toBe(true)
  })

  it('does not classify secondary and recovery routes as root tabs', () => {
    expect(isRootTabPathname('/expenses')).toBe(false)
    expect(isRootTabPathname('/fatal')).toBe(false)
  })

  it('classifies only invitation entry paths as invitation-owned', () => {
    expect(isInvitationAcceptPathname('/invitations/token-1')).toBe(true)
    expect(isInvitationAcceptPathname('/invitations')).toBe(true)
    expect(isInvitationAcceptPathname('/households/household-1')).toBe(false)
  })
})
