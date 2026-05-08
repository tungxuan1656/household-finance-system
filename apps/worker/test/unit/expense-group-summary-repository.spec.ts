import { describe, expect, it } from 'vitest'

import {
  getExpenseGroupTotalSpend,
  getGroupSummary,
} from '@/db/repositories/expense-group-summary-repository'

describe('expense group summary repository module', () => {
  it('exports summary helpers', () => {
    expect(typeof getExpenseGroupTotalSpend).toBe('function')
    expect(typeof getGroupSummary).toBe('function')
  })
})
