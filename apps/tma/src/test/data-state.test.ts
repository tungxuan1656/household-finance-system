import { describe, expect, it } from 'vitest'

import { resolveDataStateBranch } from '@/components/shared/data-state'

describe('resolveDataStateBranch', () => {
  it('prioritizes loading', () => {
    expect(
      resolveDataStateBranch({ isLoading: true, isError: true, isEmpty: true }),
    ).toBe('loading')
  })

  it('resolves error after loading', () => {
    expect(resolveDataStateBranch({ isError: true, isEmpty: true })).toBe(
      'error',
    )
  })

  it('resolves empty after error', () => {
    expect(resolveDataStateBranch({ isEmpty: true })).toBe('empty')
  })

  it('resolves content when no state flag is active', () => {
    expect(resolveDataStateBranch({})).toBe('content')
  })
})
