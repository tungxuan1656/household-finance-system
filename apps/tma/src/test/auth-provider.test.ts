import { describe, expect, it } from 'vitest'

import { deriveIsAuthenticated } from '@/features/auth/auth-provider'

describe('deriveIsAuthenticated', () => {
  it('treats an authenticated status with an access token as signed in', () => {
    expect(deriveIsAuthenticated('authenticated', 'access-1')).toBe(true)
  })

  it('treats bootstrapping or missing access tokens as signed out', () => {
    expect(deriveIsAuthenticated('bootstrapping', 'access-1')).toBe(false)
    expect(deriveIsAuthenticated('authenticated', null)).toBe(false)
  })
})
