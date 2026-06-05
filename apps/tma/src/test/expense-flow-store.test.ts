import { beforeEach, describe, expect, it } from 'vitest'

import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { categoryOptions } from '@/features/finance/mock-data'

describe('useAddExpenseFlowStore', () => {
  beforeEach(() => {
    useAddExpenseFlowStore.getState().reset()
  })

  it('stores category, details, and context in flow order', () => {
    const store = useAddExpenseFlowStore.getState()

    store.selectCategory(categoryOptions[2])

    store.setDetails({
      amount: 315000,
      sourceId: 'cash',
      note: 'Đi chợ',
    })

    store.setContext({ householdId: 'household-1', groupId: 'group-1' })

    const snapshot = useAddExpenseFlowStore.getState()

    expect(snapshot.category?.id).toBe('shopping')
    expect(snapshot.amount).toBe(315000)
    expect(snapshot.sourceId).toBe('cash')
    expect(snapshot.note).toBe('Đi chợ')
    expect(snapshot.householdId).toBe('household-1')
    expect(snapshot.groupId).toBe('group-1')
  })

  it('resets the draft to a clean state', () => {
    useAddExpenseFlowStore.getState().selectCategory(categoryOptions[0])

    useAddExpenseFlowStore.getState().setDetails({
      amount: 540000,
      sourceId: 'bank-transfer',
      note: 'Bữa tối',
    })

    useAddExpenseFlowStore.getState().reset()

    const snapshot = useAddExpenseFlowStore.getState()

    expect(snapshot.category).toBeNull()
    expect(snapshot.amount).toBe(0)
    expect(snapshot.sourceId).toBeNull()
    expect(snapshot.note).toBe('')
    expect(snapshot.householdId).toBeNull()
    expect(snapshot.groupId).toBeNull()
  })
})
