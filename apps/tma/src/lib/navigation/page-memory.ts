import { useEffect, useState } from 'react'
import { create } from 'zustand'

type PageStateValue = unknown

interface PageMemoryState {
  pageStates: Record<string, PageStateValue>
  scrollOffsets: Record<string, number>
  getPageState: <T>(key: string) => T | undefined
  setPageState: (key: string, value: PageStateValue) => void
  getScrollOffset: (key: string) => number
  setScrollOffset: (key: string, value: number) => void
  reset: () => void
}

const resolveInitialValue = <T>(initialValue: T | (() => T)): T =>
  typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue

export const pageMemoryStore = create<PageMemoryState>((set, get) => ({
  pageStates: {},
  scrollOffsets: {},
  getPageState: <T>(key: string) => get().pageStates[key] as T | undefined,
  setPageState: (key, value) =>
    set((state) => ({
      pageStates: {
        ...state.pageStates,
        [key]: value,
      },
    })),
  getScrollOffset: (key) => get().scrollOffsets[key] ?? 0,
  setScrollOffset: (key, value) =>
    set((state) => ({
      scrollOffsets: {
        ...state.scrollOffsets,
        [key]: value,
      },
    })),
  reset: () =>
    set({
      pageStates: {},
      scrollOffsets: {},
    }),
}))

export const usePageMemoryState = <T>(
  key: string,
  initialValue: T | (() => T),
) => {
  const [value, setValue] = useState<T>(() => {
    const storedValue = pageMemoryStore.getState().getPageState<T>(key)

    return storedValue ?? resolveInitialValue(initialValue)
  })

  useEffect(() => {
    pageMemoryStore.getState().setPageState(key, value)
  }, [key, value])

  return [value, setValue] as const
}
