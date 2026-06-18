import { describe, expect, it } from 'vitest'

import { createEditExpenseDraft } from '@/features/expenses/draft'

describe('createEditExpenseDraft', () => {
  it('maps an expense DTO into the edit-flow draft shape', () => {
    expect(
      createEditExpenseDraft({
        amountMinor: 12_345,
        categoryKey: 'food',
        createdAt: 0,
        currencyCode: 'USD',
        groupIds: ['group-1'],
        householdId: 'household-1',
        id: 'expense-1',
        note: null,
        occurredAt: 1_717_584_000_000,
        sourceKey: 'cash',
        spentByUserId: 'user-1',
        title: 'Lunch',
        updatedAt: 0,
      }),
    ).toEqual({
      amount: 12,
      categoryKey: 'food',
      groupId: 'group-1',
      householdId: 'household-1',
      id: 'expense-1',
      occurredAt: 1_717_584_000_000,
      sourceKey: 'cash',
      title: 'Lunch',
    })
  })
})
