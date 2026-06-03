import { create } from 'zustand'

import type { FinanceCategory } from '@/features/finance/mock-data'

export interface AddExpenseDraft {
  date: string
  category: FinanceCategory | null
  amount: number
  sourceId: string | null
  note: string
  householdId: string | null
  groupId: string | null
}

interface AddExpenseFlowState extends AddExpenseDraft {
  setDate: (date: string) => void
  selectCategory: (category: FinanceCategory) => void
  setDetails: (input: {
    amount: number
    sourceId: string | null
    note: string
  }) => void
  setContext: (input: {
    householdId: string | null
    groupId: string | null
  }) => void
  reset: () => void
}

const buildInitialDraft = (): AddExpenseDraft => ({
  date: new Date().toISOString(),
  category: null,
  amount: 0,
  sourceId: null,
  note: '',
  householdId: null,
  groupId: null,
})

export const useAddExpenseFlowStore = create<AddExpenseFlowState>((set) => ({
  ...buildInitialDraft(),
  setDate: (date) => set({ date }),
  selectCategory: (category) => set({ category }),
  setDetails: ({ amount, sourceId, note }) => set({ amount, sourceId, note }),
  setContext: ({ householdId, groupId }) => set({ householdId, groupId }),
  reset: () => set(buildInitialDraft()),
}))
