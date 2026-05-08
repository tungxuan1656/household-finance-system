import { describe, expect, it } from 'vitest'

import { computeDateRange } from '@/db/repositories/budget-period'
import { getBudgetSpendSummary } from '@/db/repositories/budget-spend-summary-repository'

describe('budget repository helpers', () => {
  it('computes monthly date range', () => {
    expect(computeDateRange('2026-02')).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    })
  })

  it('returns empty category totals when no keys requested', async () => {
    const first = async <T>() => ({ totalActualMinor: 4200 }) as T
    const all = async <T>() => ({ results: [] as T[] })
    const prepare = () => ({ bind: () => ({ first, all }) })
    const db = { prepare } as unknown as D1Database

    await expect(
      getBudgetSpendSummary(db, {
        householdId: 'household-1',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        categoryKeys: [],
      }),
    ).resolves.toEqual({
      totalActualMinor: 4200,
      categoryActualMinorByKey: {},
    })
  })
})
