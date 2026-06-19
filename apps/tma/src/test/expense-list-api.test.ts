import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()

vi.mock('@/lib/api/client', () => ({
  get: getMock,
}))

const loadHomeApi = () => import('@/features/home/api')

describe('expense list API', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('expenseSummaryQueryOptions.queryFn calls GET /expenses/summary with params', async () => {
    getMock.mockResolvedValue({
      totalSpendMinor: 100000,
      expenseCount: 5,
      currencyCode: 'VND',
    })

    const { expenseSummaryQueryOptions } = await loadHomeApi()
    const opts = expenseSummaryQueryOptions({
      date_from: 1,
      date_to: 2,
      group_id: 'group-1',
    })
    const result = await opts.queryFn!({} as any)

    expect(getMock).toHaveBeenCalledWith('/expenses/summary', {
      params: { date_from: 1, date_to: 2, group_id: 'group-1' },
    })

    expect(result).toEqual({
      totalSpendMinor: 100000,
      expenseCount: 5,
      currencyCode: 'VND',
    })
  })

  it('expenseListInfiniteQueryOptions.queryFn calls GET /expenses with cursor and preserves params', async () => {
    getMock.mockResolvedValue({
      items: [{ id: 'expense-1' }],
      nextCursor: 'cursor-2',
    })

    const { expenseListInfiniteQueryOptions } = await loadHomeApi()
    const opts = expenseListInfiniteQueryOptions({
      limit: 50,
      sort: 'occurred_at_desc',
      group_id: 'group-1',
    })
    const result = await opts.queryFn!({
      pageParam: 'cursor-1',
    } as any)

    expect(getMock).toHaveBeenCalledWith('/expenses', {
      params: {
        limit: 50,
        sort: 'occurred_at_desc',
        group_id: 'group-1',
        cursor: 'cursor-1',
      },
    })

    expect(result).toEqual({
      items: [{ id: 'expense-1' }],
      nextCursor: 'cursor-2',
    })
  })

  it('expenseListInfiniteQueryOptions.getNextPageParam returns nextCursor or undefined', async () => {
    const { expenseListInfiniteQueryOptions } = await loadHomeApi()
    const opts = expenseListInfiniteQueryOptions()

    expect(
      opts.getNextPageParam({ items: [], nextCursor: 'cursor-x' } as any),
    ).toBe('cursor-x')

    expect(
      opts.getNextPageParam({ items: [], nextCursor: null } as any),
    ).toBeUndefined()
  })
})
