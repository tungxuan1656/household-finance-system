import { describe, expect, it } from 'vitest'

import { isExpenseEditFlowPathname } from '@/lib/constants/routes'

describe('isExpenseEditFlowPathname', () => {
  it('returns true for the edit form path itself', () => {
    expect(isExpenseEditFlowPathname('/expenses/exp-1/edit')).toBe(true)
  })

  it('returns true for the category sub-page', () => {
    expect(isExpenseEditFlowPathname('/expenses/exp-1/edit/category')).toBe(
      true,
    )
  })

  it('returns true for any sub-path under /expenses/:id/edit', () => {
    expect(
      isExpenseEditFlowPathname('/expenses/exp-1/edit/some/deep/path'),
    ).toBe(true)
  })

  it('returns false for the expense detail page', () => {
    expect(isExpenseEditFlowPathname('/expenses/exp-1')).toBe(false)
  })

  it('returns false for the expense list', () => {
    expect(isExpenseEditFlowPathname('/expenses')).toBe(false)
  })

  it('returns false for the home page', () => {
    expect(isExpenseEditFlowPathname('/home')).toBe(false)
  })

  it('returns false for root', () => {
    expect(isExpenseEditFlowPathname('/')).toBe(false)
  })

  // ── With expenseId scoping ──────────────────────────────────────────

  it('returns true when expenseId matches the id in the pathname', () => {
    expect(
      isExpenseEditFlowPathname('/expenses/exp-1/edit/category', 'exp-1'),
    ).toBe(true)
  })

  it('returns false when expenseId differs from the id in the pathname', () => {
    // Navigating from exp-1's edit page to exp-2's edit page is leaving
    // the original edit flow, so the caller should reset.
    expect(isExpenseEditFlowPathname('/expenses/exp-2/edit', 'exp-1')).toBe(
      false,
    )
  })

  it('returns false when no expense id is present in the pathname', () => {
    expect(isExpenseEditFlowPathname('/', 'exp-1')).toBe(false)
  })
})
