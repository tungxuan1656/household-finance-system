import { describe, expect, it } from 'vitest'

import {
  buildPeriodWhereClause,
  buildVisibleExpenseConditions,
} from '@/db/repositories/expense-query-scope'
import {
  decodeCursor,
  encodeCursor,
} from '@/db/repositories/expense-query-cursor'

describe('expense query helpers', () => {
  it('builds personal visibility conditions', () => {
    const scope = buildVisibleExpenseConditions('user-1')

    expect(scope.conditions).toEqual([
      'e.deleted_at IS NULL',
      'e.spent_by_user_id = ?',
    ])
    expect(scope.params).toEqual(['user-1'])
  })

  it('builds household period scope', () => {
    const scope = buildPeriodWhereClause('user-1', 'household-1', 100, 200)

    expect(scope.whereClause).toContain('e.household_id = ?')
    expect(scope.whereClause).toContain('hm.user_id = ?')
    expect(scope.whereClause).toContain('e.occurred_at >= ?')
    expect(scope.whereClause).toContain('e.occurred_at < ?')
    expect(scope.params).toEqual(['household-1', 'user-1', 100, 200])
  })

  it('encodes and decodes amount cursor', () => {
    const cursor = encodeCursor('amount_desc', {
      amount_minor: 1500,
      occurred_at: 2000,
      id: 'expense-1',
    })

    expect(decodeCursor(cursor)).toEqual({
      sort: 'amount_desc',
      amountMinor: 1500,
      occurredAt: 2000,
      id: 'expense-1',
    })
  })
})
