import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()

vi.mock('@/lib/api/client', () => ({
  get: getMock,
}))

const loadIncomesApi = () => import('@/features/incomes/api')

describe('incomes API', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('incomeListInfiniteQueryOptions.queryFn calls GET /incomes with cursor', async () => {
    getMock.mockResolvedValue({
      items: [{ id: 'income-1', amountMinor: 5000000, title: 'Lương' }],
      nextCursor: 'cursor-2',
    })

    const { incomeListInfiniteQueryOptions } = await loadIncomesApi()
    const opts = incomeListInfiniteQueryOptions({ limit: 50 })
    const result = await opts.queryFn!({ pageParam: 'cursor-1' } as any)

    expect(getMock).toHaveBeenCalledWith('/incomes', {
      params: { limit: 50, cursor: 'cursor-1' },
    })

    expect(result).toEqual({
      items: [{ id: 'income-1', amountMinor: 5000000, title: 'Lương' }],
      nextCursor: 'cursor-2',
    })
  })

  it('incomeListInfiniteQueryOptions.getNextPageParam returns nextCursor or undefined', async () => {
    const { incomeListInfiniteQueryOptions } = await loadIncomesApi()
    const opts = incomeListInfiniteQueryOptions()

    expect(
      opts.getNextPageParam({ items: [], nextCursor: 'cursor-x' } as any),
    ).toBe('cursor-x')

    expect(
      opts.getNextPageParam({ items: [], nextCursor: null } as any),
    ).toBeUndefined()
  })
})
