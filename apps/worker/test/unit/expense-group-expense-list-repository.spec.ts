import { describe, expect, it } from 'vitest'

import { listExpensesByGroup } from '@/db/repositories/expense-group-expense-list-repository'

describe('expense group expense list repository module', () => {
  it('exports listExpensesByGroup', () => {
    expect(typeof listExpensesByGroup).toBe('function')
  })
})
