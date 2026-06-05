import { beforeEach, describe, expect, it } from 'vitest'

import {
  type ExpenseCategorySelection,
  useAddExpenseFlowStore,
} from '@/features/expenses/store'

const categoryOptions: ExpenseCategorySelection[] = [
  {
    id: 'food',
    label: 'Ăn uống',
    symbol: 'AU',
    accent: { background: '#edf4ff', foreground: '#3f7cff' },
  },
  {
    id: 'transport',
    label: 'Di chuyển',
    symbol: 'DC',
    accent: { background: '#eef9f0', foreground: '#2f9b44' },
  },
  {
    id: 'shopping',
    label: 'Mua sắm',
    symbol: 'MS',
    accent: { background: '#fff3e8', foreground: '#ff8a3d' },
  },
]

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
      title: 'Đi chợ',
    })

    store.setContext({ householdId: 'household-1', groupId: 'group-1' })

    const snapshot = useAddExpenseFlowStore.getState()

    expect(snapshot.category?.id).toBe('shopping')
    expect(snapshot.amount).toBe(315000)
    expect(snapshot.sourceId).toBe('cash')
    expect(snapshot.title).toBe('Đi chợ')
    expect(snapshot.householdId).toBe('household-1')
    expect(snapshot.groupId).toBe('group-1')
  })

  it('resets the draft to a clean state', () => {
    useAddExpenseFlowStore.getState().selectCategory(categoryOptions[0])

    useAddExpenseFlowStore.getState().setDetails({
      amount: 540000,
      sourceId: 'bank-transfer',
      title: 'Bữa tối',
    })

    useAddExpenseFlowStore.getState().reset()

    const snapshot = useAddExpenseFlowStore.getState()

    expect(snapshot.category).toBeNull()
    expect(snapshot.amount).toBe(0)
    expect(snapshot.sourceId).toBeNull()
    expect(snapshot.title).toBe('')
    expect(snapshot.householdId).toBeNull()
    expect(snapshot.groupId).toBeNull()
  })
})
