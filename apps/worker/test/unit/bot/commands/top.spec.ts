import { describe, expect, it, vi } from 'vitest'

import { handleTopCommand } from '@/bot/commands/top'
import type { CommandContext } from '@/bot/types'

const mockDb = {
  prepare: () => ({
    bind: () => ({
      first: async () => null,
      all: async () => ({ results: [] }),
      run: async () => ({ meta: { changes: 0 } }),
    }),
  }),
} as unknown as D1Database

const buildCtx = (overrides: Partial<CommandContext> = {}): CommandContext => ({
  userId: 123_456_789,
  chatId: 987_654_321,
  userDisplayName: null,
  text: '/top',
  appUserId: null,
  locale: 'vi',
  db: mockDb,
  ...overrides,
})

vi.mock('@/db/repositories/expense-analytics-repository', () => ({
  getAnalyticsOverview: vi.fn().mockResolvedValue({
    totalSpendMinor: 15000000,
    expenseCount: 3,
    currencyCode: 'VND',
    topCategories: [
      {
        categoryKey: 'food',
        totalSpendMinor: 10000000,
        percentOfTotal: 67,
        expenseCount: 5,
      },
      {
        categoryKey: 'transport',
        totalSpendMinor: 5000000,
        percentOfTotal: 33,
        expenseCount: 2,
      },
    ],
    dailySpend: [],
    period: '2026-06',
    householdId: null,
  }),
}))

vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/household-repository', () => ({
  findHouseholdById: vi.fn().mockResolvedValue(null),
}))

describe('handleTopCommand', () => {
  it('returns unlinked guidance when appUserId is null', async () => {
    const result = await handleTopCommand(buildCtx())

    expect(result.text).toContain('Mở Mini App')
  })

  it('returns top categories for linked user personal scope', async () => {
    const ctx = buildCtx({ appUserId: 'user-1', text: '/top' })
    const result = await handleTopCommand(ctx)

    expect(result.text).toContain('Danh mục chi tiêu')
    expect(result.text).toContain('cá nhân')
    expect(result.text).toContain('Ăn uống')
    expect(result.text).toContain('Di chuyển')
  })

  it('returns top categories for household scope', async () => {
    const householdMembershipModule =
      await import('@/db/repositories/household-membership-repository')
    const householdRepoModule =
      await import('@/db/repositories/household-repository')
    const analyticsModule =
      await import('@/db/repositories/expense-analytics-repository')

    vi.mocked(
      householdMembershipModule.listActiveHouseholdIdsForUser,
    ).mockResolvedValue(['hh-1'])
    vi.mocked(householdRepoModule.findHouseholdById).mockResolvedValue({
      id: 'hh-1',
      name: 'Gia đình Test',
      slug: 'gia-dinh-test',
      defaultCurrencyCode: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      createdAt: 0,
    } as never)
    vi.mocked(analyticsModule.getAnalyticsOverview).mockResolvedValue({
      totalSpendMinor: 30000000,
      expenseCount: 10,
      currencyCode: 'VND',
      topCategories: [
        {
          categoryKey: 'food',
          totalSpendMinor: 20000000,
          percentOfTotal: 67,
          expenseCount: 8,
        },
      ],
      dailySpend: [],
      period: '2026-06',
      householdId: 'hh-1',
    })

    const ctx = buildCtx({ appUserId: 'user-1', text: '/top hh:hh-1' })
    const result = await handleTopCommand(ctx)

    expect(result.text).toContain('Gia đình Test')
    expect(result.text).toContain('Ăn uống')
  })
})
