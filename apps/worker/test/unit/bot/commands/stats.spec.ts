import { describe, expect, it, vi } from 'vitest'

import { handleStatsCommand } from '@/bot/commands/stats'
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
  text: '/stats',
  appUserId: null,
  locale: 'vi',
  db: mockDb,
  telegramBotTmaUrl: 'https://phofis-tma.pages.dev/',
  telegramBotDeepLinkUrl: 'https://t.me/phofis_bot',
  ...overrides,
})

// Mock the repository modules
vi.mock('@/db/repositories/expense-analytics-repository', () => ({
  getAnalyticsOverview: vi.fn().mockResolvedValue({
    totalSpendMinor: 15000000,
    expenseCount: 3,
    currencyCode: 'VND',
    topCategories: [],
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

describe('handleStatsCommand', () => {
  it('returns unlinked guidance when appUserId is null', async () => {
    const result = await handleStatsCommand(buildCtx())

    expect(result.text).toContain('Mở Mini App')
    expect(result.text).toContain('đăng nhập')
  })

  it('returns personal stats for linked user with no scope arg', async () => {
    const ctx = buildCtx({ appUserId: 'user-1', text: '/stats' })
    const result = await handleStatsCommand(ctx)

    expect(result.text).toContain('Thống kê')
    expect(result.text).toContain('cá nhân')
  })

  it('returns household stats for linked user with hh: arg', async () => {
    const analyticsModule =
      await import('@/db/repositories/expense-analytics-repository')
    const householdMembershipModule =
      await import('@/db/repositories/household-membership-repository')
    const householdRepoModule =
      await import('@/db/repositories/household-repository')

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
      description: null,
      avatarUrl: null,
      createdById: 'user-1',
    } as never)
    vi.mocked(analyticsModule.getAnalyticsOverview).mockResolvedValue({
      totalSpendMinor: 30000000,
      expenseCount: 10,
      currencyCode: 'VND',
      topCategories: [],
      dailySpend: [],
      period: '2026-06',
      householdId: 'hh-1',
    })

    const ctx = buildCtx({ appUserId: 'user-1', text: '/stats hh:hh-1' })
    const result = await handleStatsCommand(ctx)

    expect(result.text).toContain('Thống kê')
    expect(result.text).toContain('Gia đình Test')
  })

  it('returns inaccessible household message when user is not a member', async () => {
    const householdMembershipModule =
      await import('@/db/repositories/household-membership-repository')

    vi.mocked(
      householdMembershipModule.listActiveHouseholdIdsForUser,
    ).mockResolvedValue(['hh-other'])

    const ctx = buildCtx({ appUserId: 'user-1', text: '/stats hh:hh-unknown' })
    const result = await handleStatsCommand(ctx)

    expect(result.text).toContain('không có quyền')
  })
})
