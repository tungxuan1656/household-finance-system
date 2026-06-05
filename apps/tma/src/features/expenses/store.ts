import { create } from 'zustand'

import type { FinanceCategory } from '@/features/finance/mock-data'
import type { CategoryKey, SourceKey } from '@/features/home/types'

export interface AddExpenseDraft {
  date: string
  category: FinanceCategory | null
  amount: number
  sourceId: SourceKey | null
  note: string
  householdId: string | null
  groupId: string | null
}

interface AddExpenseFlowState extends AddExpenseDraft {
  setDate: (date: string) => void
  selectCategory: (category: FinanceCategory) => void
  setDetails: (input: {
    amount: number
    sourceId: SourceKey | null
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

export interface EditExpenseDraft {
  id: string
  title: string
  amount: number
  occurredAt: number
  categoryKey: CategoryKey
  sourceKey: SourceKey
  householdId: string | null
  note: string
}

interface EditExpenseFlowState {
  draft: EditExpenseDraft | null
  setDraft: (draft: EditExpenseDraft) => void
  updateDraft: (fields: Partial<EditExpenseDraft>) => void
  reset: () => void
}

export const useEditExpenseStore = create<EditExpenseFlowState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  updateDraft: (fields) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...fields } : null,
    })),
  reset: () => set({ draft: null }),
}))
