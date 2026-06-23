import { describe, expect, it, vi, beforeEach } from 'vitest'

import { runBudgetAlerts } from '@/bot/notifications/budget-alerts'
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
  mockSendNotif,
} = vi.hoisted(() => {
  const mlh = vi.fn().mockResolvedValue([])
  const mlb = vi.fn().mockResolvedValue([])
  const mgs = vi
    .fn()
    .mockResolvedValue({ totalActualMinor: 0, categoryActualMinorByKey: {} })
  const mfl = vi.fn().mockResolvedValue([])
  const mfh = vi.fn().mockResolvedValue(null)
  const msn = vi.fn().mockResolvedValue('sent')
  return {
    mockListHouseholdIds: mlh,
    mockListBudgets: mlb,
    mockGetSummary: mgs,
    mockFindLimits: mfl,
    mockFindHousehold: mfh,
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

vi.mock('@/bot/notifications/sender', () => ({
  sendNotification: mockSendNotif,
}))

vi.mock('@/bot/notifications/renderers', () => ({
  renderBudgetAlertText: vi.fn().mockReturnValue('Alert text'),
  budgetAlertKeyboard: vi.fn().mockReturnValue({ inline_keyboard: [] }),
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

describe('runBudgetAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendNotif.mockResolvedValue('sent')
    mockGetSummary.mockResolvedValue({
      totalActualMinor: 0,
      categoryActualMinorByKey: {},
    })
    mockListBudgets.mockResolvedValue([])
    mockListHouseholdIds.mockResolvedValue([])
  })

  const setupBudget = (overrides: Record<string, unknown> = {}) => {
    mockListBudgets.mockResolvedValue([
      {
        id: 'budget-1',
        scope: 'personal',
        householdId: null,
        ownerUserId: 'user-1',
        budgetMonth: new Date().toISOString().slice(0, 7),
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        currencyCode: 'VND',
        totalLimitMinor: 10000000,
        categoryId: null,
        createdByUserId: 'user-1',
        archivedAt: null,
        createdAt: 0,
        updatedAt: 0,
        ...overrides,
      },
    ])
  }

  it('no linked chats → no sends', async () => {
    const db = buildMockDb([])

    await runBudgetAlerts(db, mockClient, 'https://phofis-tma.pages.dev/')

    expect(mockSendNotif).toHaveBeenCalledTimes(0)
  })

  it('budget_alerts=false → sender gates on requiredPref', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    setupBudget()
    mockGetSummary.mockResolvedValue({
      totalActualMinor: 8500000,
      categoryActualMinorByKey: {},
    })

    await runBudgetAlerts(db, mockClient, 'https://phofis-tma.pages.dev/')

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    expect(mockSendNotif.mock.calls[0][0].requiredPref).toBe('budget_alerts')
  })

  it('warning 80%: sends one notification per budget/user/period', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    setupBudget()
    mockGetSummary.mockResolvedValue({
      totalActualMinor: 8500000,
      categoryActualMinorByKey: {},
    })

    await runBudgetAlerts(db, mockClient, 'https://phofis-tma.pages.dev/')

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    expect(mockSendNotif.mock.calls[0][0].notificationType).toBe(
      'budget_warning',
    )
  })

  it('exceeded 100%: sends exceeded notification', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    setupBudget()
    mockGetSummary.mockResolvedValue({
      totalActualMinor: 12000000,
      categoryActualMinorByKey: {},
    })

    await runBudgetAlerts(db, mockClient, 'https://phofis-tma.pages.dev/')

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    expect(mockSendNotif.mock.calls[0][0].notificationType).toBe(
      'budget_exceeded',
    )
  })

  it('H3: corrupt budget scope skipped without querying', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    // Corrupt: scope=personal but no ownerUserId
    setupBudget({ ownerUserId: null })

    await runBudgetAlerts(db, mockClient, 'https://phofis-tma.pages.dev/')

    expect(mockSendNotif).toHaveBeenCalledTimes(0)
  })

  it('M2: error in processing does not crash the whole job', async () => {
    const db = buildMockDb([{ telegram_user_id: 'tg-1', user_id: 'user-1' }])
    // Make listBudgets throw
    mockListBudgets.mockRejectedValue(new Error('DB error'))

    await expect(
      runBudgetAlerts(db, mockClient, 'https://phofis-tma.pages.dev/'),
    ).resolves.toBeUndefined()
  })
})
