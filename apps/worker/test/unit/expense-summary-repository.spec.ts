import { describe, expect, it } from 'vitest'

import { summarizeExpenses } from '@/db/repositories/expense-summary-repository'

describe('expense summary repository module', () => {
  it('exports summarizeExpenses', () => {
    expect(typeof summarizeExpenses).toBe('function')
  })
})
