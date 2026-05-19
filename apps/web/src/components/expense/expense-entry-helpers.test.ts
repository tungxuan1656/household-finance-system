import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('@/lib/reference-data/labels', () => ({
  getCategoryLabel: (key: string) => `categories.${key}`,
}))

import {
  formatOccurredAtDate,
  getExpenseTitlePlaceholder,
  parseOccurredAtDate,
} from '@/components/expense/expense-entry-helpers'

describe('expense-entry-helpers', () => {
  it('formats and parses occurredAt values with local date helpers', () => {
    const date = '2026-05-08'

    expect(formatOccurredAtDate(parseOccurredAtDate(date))).toBe(date)
  })

  it('returns translated title when category missing', () => {
    expect(getExpenseTitlePlaceholder(undefined)).toBe('expense.title')
  })

  it('returns category label placeholder when category exists', () => {
    expect(getExpenseTitlePlaceholder('food')).toBe('categories.food')
  })
})
