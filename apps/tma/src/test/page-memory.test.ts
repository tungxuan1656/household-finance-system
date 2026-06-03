import { beforeEach, describe, expect, it } from 'vitest'

import { pageMemoryStore } from '@/lib/navigation/page-memory'

describe('pageMemoryStore', () => {
  beforeEach(() => {
    pageMemoryStore.getState().reset()
  })

  it('stores page ui state by key without leaking across pages', () => {
    const store = pageMemoryStore.getState()

    store.setPageState('statistics', { monthIndex: 2, range: 'month' })
    store.setPageState('expenses', { showFilters: true })

    expect(store.getPageState('statistics')).toEqual({
      monthIndex: 2,
      range: 'month',
    })

    expect(store.getPageState('expenses')).toEqual({ showFilters: true })
    expect(store.getPageState('home')).toBeUndefined()
  })

  it('stores scroll offsets independently per page key', () => {
    const store = pageMemoryStore.getState()

    store.setScrollOffset('home', 248)
    store.setScrollOffset('expenses', 912)

    expect(store.getScrollOffset('home')).toBe(248)
    expect(store.getScrollOffset('expenses')).toBe(912)
    expect(store.getScrollOffset('statistics')).toBe(0)
  })
})
