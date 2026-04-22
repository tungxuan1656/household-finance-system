import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { formatValidationDetails, resolveLocale, translate } from '@/lib/i18n'

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

  it('preserves schema-provided too_small messages in validation details', () => {
    const schema = z.object({
      displayName: z
        .string()
        .trim()
        .min(1, 'Tên hiển thị không được để trống.'),
    })

    const parsed = schema.safeParse({
      displayName: '   ',
    })

    expect(parsed.success).toBe(false)

    if (!parsed.success) {
      const details = formatValidationDetails(parsed.error.issues, 'vi')

      expect(details.fieldErrors.displayName).toEqual([
        'Tên hiển thị không được để trống.',
      ])
    }
  })

  it('preserves schema-provided too_big messages in validation details', () => {
    const schema = z.object({
      displayName: z
        .string()
        .max(4, 'Tên hiển thị không được dài quá 4 ký tự.'),
    })

    const parsed = schema.safeParse({
      displayName: 'Tên hiển thị quá dài',
    })

    expect(parsed.success).toBe(false)

    if (!parsed.success) {
      const details = formatValidationDetails(parsed.error.issues, 'vi')

      expect(details.fieldErrors.displayName).toEqual([
        'Tên hiển thị không được dài quá 4 ký tự.',
      ])
    }
  })
})
