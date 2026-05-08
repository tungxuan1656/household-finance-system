import { describe, expect, it } from 'vitest'

import {
  findGroupIdsForExpense,
  findGroupIdsForExpenses,
  replaceExpenseGroupAssignments,
} from '@/db/repositories/expense-group-assignment-repository'

describe('expense group assignment repository module', () => {
  it('exports assignment helpers', () => {
    expect(typeof findGroupIdsForExpense).toBe('function')
    expect(typeof findGroupIdsForExpenses).toBe('function')
    expect(typeof replaceExpenseGroupAssignments).toBe('function')
  })
})
