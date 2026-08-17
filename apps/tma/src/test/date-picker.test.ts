import { describe, expect, it } from 'vitest'

import { formatDateDisplay } from '@/components/shared/date-picker'

describe('formatDateDisplay', () => {
  it('formats a valid date value', () => {
    expect(formatDateDisplay('2026-08-17')).toBe('17/08/2026')
  })

  it('leaves an empty value unchanged', () => {
    expect(formatDateDisplay('')).toBe('')
  })
})
