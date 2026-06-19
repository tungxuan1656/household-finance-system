import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const postMock = vi.fn()

vi.mock('@/lib/api/client', () => ({
  post: postMock,
}))

const loadImportApi = () => import('@/features/expenses/import-api')

describe('parseExpenses API', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('posts to /expenses/parse with text and defaultOccurredAt', async () => {
    const { parseExpenses } = await loadImportApi()

    await parseExpenses({
      text: 'ăn sáng 35k, đi xe ôm 50k',
      defaultOccurredAt: '2026-06-19',
    })

    expect(postMock).toHaveBeenCalledTimes(1)

    expect(postMock).toHaveBeenCalledWith('/expenses/parse', {
      text: 'ăn sáng 35k, đi xe ôm 50k',
      defaultOccurredAt: '2026-06-19',
    })
  })

  it('returns parsed expenses array from response', async () => {
    const fixture = {
      expenses: [
        {
          amount: 35000,
          categoryKey: 'food',
          sourceKey: 'bank-transfer',
          title: 'Ăn sáng',
          occurredAt: '2026-06-19',
        },
        {
          amount: 50000,
          categoryKey: 'transport',
          sourceKey: 'bank-transfer',
          title: 'Đi xe ôm',
          occurredAt: '2026-06-19',
        },
      ],
    }
    postMock.mockResolvedValueOnce(fixture)

    const { parseExpenses } = await loadImportApi()

    const result = await parseExpenses({
      text: 'ăn sáng 35k, đi xe ôm 50k',
      defaultOccurredAt: '2026-06-19',
    })

    expect(result).toEqual(fixture)
  })

  it('exposes a useParseExpensesMutation hook function', async () => {
    const { useParseExpensesMutation } = await loadImportApi()

    expect(typeof useParseExpensesMutation).toBe('function')
  })
})
