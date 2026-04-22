import { describe, expect, it } from 'vitest'

import { resolveLocale, translate } from '@/lib/i18n'

describe('backend i18n foundation', () => {
  it('falls back to vi for unsupported locale hints', () => {
    expect(resolveLocale('en-US,en;q=0.9')).toBe('vi')
  })

  it('resolves vi locale hints directly', () => {
    expect(resolveLocale('vi-VN,vi;q=0.9')).toBe('vi')
  })

  it('translates backend messages in Vietnamese', () => {
    expect(translate('vi', 'errors.routeNotFound')).toBe(
      'Không tìm thấy đường dẫn.',
    )
  })
})
