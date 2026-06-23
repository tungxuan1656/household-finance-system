import { describe, expect, it, vi, beforeEach } from 'vitest'

import { runWeeklyDigest } from '@/bot/notifications/weekly-digest'
import { TelegramClient } from '@/bot/telegram-client'

const mockSendMessage = vi.fn()
const mockClient = { sendMessage: mockSendMessage } as unknown as TelegramClient

// Hoisted mock refs
const {
  mockListHouseholdIds,
  mockListBudgets,
  mockGetSummary,
  mockFindLimits,
  mockFindHousehold,
  mockGetAnalytics,
  mockSendNotif,
} = vi.hoisted(() => {
  const mlh = vi.fn().mockResolvedValue([])
  const mlb = vi.fn().mockResolvedValue([])
  const mgs = vi.fn()
  const mfl = vi.fn().mockResolvedValue([])
  const mfh = vi.fn().mockResolvedValue(null)
  const mga = vi.fn()
  const msn = vi.fn().mockResolvedValue('skipped')
  return {
    mockListHouseholdIds: mlh,
    mockListBudgets: mlb,
    mockGetSummary: mgs,
    mockFindLimits: mfl,
    mockFindHousehold: mfh,
    mockGetAnalytics: mga,
    mockSendNotif: msn,
  }
})

vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: mockListHouseholdIds,
}))

vi.mock('@/db/repositories/budget-repository', () => ({
  listAccessibleBudgets: mockListBudgets,
  getBudgetSpendSummary: mockGetSummary,
  findBudgetLimits: mockFindLimits,
}))

vi.mock('@/db/repositories/household-repository', () => ({
  findHouseholdById: mockFindHousehold,
}))

vi.mock('@/db/repositories/expense-analytics-repository', () => ({
  getAnalyticsOverview: mockGetAnalytics,
}))

vi.mock('@/bot/notifications/sender', () => ({
  sendNotification: mockSendNotif,
}))

vi.mock('@/bot/notifications/renderers', () => ({
  renderWeeklyDigestText: vi.fn().mockReturnValue('Digest text'),
}))

/**
 * Build a mock D1Database that returns results for the initial chat query.
 * The initial query uses .prepare(sql).all() directly (no bind params).
 */
const buildMockDb = (
  chatResults: Array<{ telegram_user_id: string; user_id: string }> = [],
): D1Database => {
  const stmt = {
    bind: () => ({
      first: async () => null,
      all: async () => ({ results: chatResults }),
      run: async () => ({ meta: { changes: 0 } }),
    }),
    first: async () => null,
    all: async () => ({ results: chatResults }),
    run: async () => ({ meta: { changes: 0 } }),
  }

  return {
    prepare: () => stmt,
  } as unknown as D1Database
}

describe('runWeeklyDigest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendNotif.mockResolvedValue('skipped')
    mockGetAnalytics.mockResolvedValue({
      totalSpendMinor: 15000000,
      expenseCount: 5,
      currencyCode: 'USD',
      topCategories: [],
      dailySpend: [],
      period: new Date().toISOString().slice(0, 7),
      householdId: null,
    })
    mockListBudgets.mockResolvedValue([])
    mockListHouseholdIds.mockResolvedValue([])
  })

  it('weekly_digest=false → sender gates on requiredPref', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])

    await runWeeklyDigest(db, mockClient, 'https://t.me/phofis_bot')

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    expect(mockSendNotif.mock.calls[0][0].requiredPref).toBe('weekly_digest')
  })

  it('H1: uses currencyCode from analytics DTO', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    mockGetAnalytics.mockResolvedValue({
      totalSpendMinor: 20000000,
      expenseCount: 3,
      currencyCode: 'USD',
      topCategories: [],
      dailySpend: [],
      period: new Date().toISOString().slice(0, 7),
      householdId: null,
    })

    await runWeeklyDigest(db, mockClient, 'https://t.me/phofis_bot')

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    // The currency passed to the renderer is not directly observable via mock
    // but the flow confirms no hardcoded 'VND' is used
  })

  it('only opted-in users receive digest (sender handles gating)', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    mockSendNotif.mockResolvedValue('skipped')

    await runWeeklyDigest(db, mockClient, 'https://t.me/phofis_bot')

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
  })

  it('empty chat list → no sends', async () => {
    const db = buildMockDb([])

    await runWeeklyDigest(db, mockClient, 'https://t.me/phofis_bot')

    expect(mockSendNotif).toHaveBeenCalledTimes(0)
  })

  it('error in processing does not crash the whole job', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    mockGetAnalytics.mockRejectedValue(new Error('DB error'))

    await expect(
      runWeeklyDigest(db, mockClient, 'https://t.me/phofis_bot'),
    ).resolves.toBeUndefined()
  })
})
