import { create } from 'zustand'

import type { ParsedExpenseItem } from './import-api'

export interface ImportItemDraft {
  id: string
  parsed: ParsedExpenseItem
  include: boolean
  status: 'pending' | 'success' | 'error'
  error?: string
  householdId: string | null
  groupId: string | null
}

interface ImportFlowState {
  rawText: string
  items: ImportItemDraft[]
  setRawText: (text: string) => void
  setItems: (items: ParsedExpenseItem[]) => void
  toggleInclude: (id: string) => void
  setItemContext: (
    id: string,
    context: { householdId?: string; groupId?: string },
  ) => void
  setItemStatus: (
    id: string,
    status: 'pending' | 'success' | 'error',
    error?: string,
  ) => void
  reset: () => void
}

const generateId = (): string => crypto.randomUUID()

export const useImportFlowStore = create<ImportFlowState>((set) => ({
  rawText: '',
  items: [],

  setRawText: (text) => set({ rawText: text }),

  setItems: (parsedItems) =>
    set({
      items: parsedItems.map((parsed) => ({
        id: generateId(),
        parsed,
        include: true,
        status: 'pending' as const,
        householdId: null,
        groupId: null,
      })),
    }),

  toggleInclude: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, include: !item.include } : item,
      ),
    })),

  setItemContext: (id, context) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...(context.householdId !== undefined
                ? { householdId: context.householdId }
                : {}),
              ...(context.groupId !== undefined
                ? { groupId: context.groupId }
                : {}),
            }
          : item,
      ),
    })),

  setItemStatus: (id, status, error) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status, ...(error !== undefined ? { error } : {}) }
          : item,
      ),
    })),

  reset: () => set({ rawText: '', items: [] }),
}))
