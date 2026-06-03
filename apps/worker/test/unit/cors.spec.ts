import { describe, expect, it } from 'vitest'

import { isAllowedCorsOrigin, resolveCorsOrigin } from '@/lib/cors'

describe('cors helper', () => {
  it('allows localhost and loopback development origins on any port', () => {
    expect(isAllowedCorsOrigin('http://localhost:3000')).toBe(true)
    expect(isAllowedCorsOrigin('http://localhost:3001')).toBe(true)
    expect(isAllowedCorsOrigin('http://127.0.0.1:3000')).toBe(true)
    expect(isAllowedCorsOrigin('http://127.0.0.1:8787')).toBe(true)
    expect(isAllowedCorsOrigin('http://[::1]:3000')).toBe(true)
  })

  it('allows the existing shared-network development origin', () => {
    expect(isAllowedCorsOrigin('http://100.116.7.43:3000')).toBe(true)
    expect(isAllowedCorsOrigin('http://100.116.7.43:3001')).toBe(true)
    expect(isAllowedCorsOrigin('http://100.116.7.43:5174')).toBe(true)
  })

  it('rejects unknown, invalid, or unsupported origins', () => {
    expect(isAllowedCorsOrigin('https://localhost:3000')).toBe(false)
    expect(isAllowedCorsOrigin('https://100.116.7.43:3001')).toBe(false)
    expect(isAllowedCorsOrigin('https://evil.example')).toBe(false)
    expect(isAllowedCorsOrigin('not-a-url')).toBe(false)
  })

  it('returns the original origin only when it is allowed', () => {
    expect(resolveCorsOrigin('http://localhost:3001')).toBe(
      'http://localhost:3001',
    )
    expect(resolveCorsOrigin('http://100.116.7.43:3001')).toBe(
      'http://100.116.7.43:3001',
    )
    expect(resolveCorsOrigin()).toBe('')
    expect(resolveCorsOrigin(null)).toBe('')
  })
})
