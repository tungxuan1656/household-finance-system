import { describe, expect, it } from 'vitest'

import { resolveLocale } from './resolve-locale'

describe('resolveLocale', () => {
  it('keeps vi inputs as vi', () => {
    expect(resolveLocale('vi')).toBe('vi')
    expect(resolveLocale('vi-VN')).toBe('vi')
  })

  it('falls back to vi for unsupported browser languages', () => {
    expect(resolveLocale('en-US')).toBe('vi')
    expect(resolveLocale('fr')).toBe('vi')
  })

  it('falls back to vi when the input is missing', () => {
    expect(resolveLocale()).toBe('vi')
    expect(resolveLocale(null)).toBe('vi')
  })
})
