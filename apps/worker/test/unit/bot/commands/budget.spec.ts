import { describe, expect, it, vi } from 'vitest'

import { handleBudgetCommand } from '@/bot/commands/budget'
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
  text: '/budget',
  appUserId: null,
  locale: 'vi',
  db: mockDb,
  telegramBotTmaUrl: 'https://phofis-tma.pages.dev/',
  telegramBotDeepLinkUrl: 'https://t.me/phofis_bot',
  ...overrides,
})

vi.mock('@/db/repositories/budget-repository', () => ({
  listAccessibleBudgets: vi.fn().mockResolvedValue([]),
  getBudgetSpendSummary: vi.fn(),
}))

vi.mock('@/db/repositories/budget-limit-repository', () => ({
  findBudgetLimits: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/household-repository', () => ({
  findHouseholdById: vi.fn().mockResolvedValue(null),
}))

describe('handleBudgetCommand', () => {
  it('returns unlinked guidance when appUserId is null', async () => {
    const result = await handleBudgetCommand(buildCtx())

    expect(result.text).toContain('Mở Mini App')
  })

  it('shows empty budget message when no budgets exist', async () => {
    const ctx = buildCtx({ appUserId: 'user-1', text: '/budget' })
    const result = await handleBudgetCommand(ctx)

    expect(result.text).toContain('Chưa có ngân sách')
  })

  it('shows personal budget with OK status', async () => {
    const budgetModule = await import('@/db/repositories/budget-repository')
    const budgetLimitModule =
      await import('@/db/repositories/budget-limit-repository')

    vi.mocked(budgetModule.listAccessibleBudgets).mockResolvedValue([
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
      },
    ])

    vi.mocked(budgetModule.getBudgetSpendSummary).mockResolvedValue({
      totalActualMinor: 2000000,
      categoryActualMinorByKey: {},
    })

    vi.mocked(budgetLimitModule.findBudgetLimits).mockResolvedValue([])

    const ctx = buildCtx({ appUserId: 'user-1', text: '/budget' })
    const result = await handleBudgetCommand(ctx)

    expect(result.text).toContain('Ngân sách')
    expect(result.text).toContain('🟢')
    expect(result.text).toContain('Ngân sách cá nhân')
    expect(result.text).toContain('10.000.000')
    expect(result.text).toContain('2.000.000')
    expect(result.text).toContain('VND')
    expect(result.text).toContain('Đã dùng 20%')
  })

  it('shows warning status for near-exhausted budget', async () => {
    const budgetModule = await import('@/db/repositories/budget-repository')
    const budgetLimitModule =
      await import('@/db/repositories/budget-limit-repository')

    vi.mocked(budgetModule.listAccessibleBudgets).mockResolvedValue([
      {
        id: 'budget-2',
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
      },
    ])

    vi.mocked(budgetModule.getBudgetSpendSummary).mockResolvedValue({
      totalActualMinor: 8500000,
      categoryActualMinorByKey: {},
    })

    vi.mocked(budgetLimitModule.findBudgetLimits).mockResolvedValue([])

    const ctx = buildCtx({ appUserId: 'user-1', text: '/budget' })
    const result = await handleBudgetCommand(ctx)

    expect(result.text).toContain('🟡')
    expect(result.text).toContain('Đã dùng 85%')
  })

  it('shows exceeded status for over-budget', async () => {
    const budgetModule = await import('@/db/repositories/budget-repository')
    const budgetLimitModule =
      await import('@/db/repositories/budget-limit-repository')

    vi.mocked(budgetModule.listAccessibleBudgets).mockResolvedValue([
      {
        id: 'budget-3',
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
      },
    ])

    vi.mocked(budgetModule.getBudgetSpendSummary).mockResolvedValue({
      totalActualMinor: 12000000,
      categoryActualMinorByKey: {},
    })

    vi.mocked(budgetLimitModule.findBudgetLimits).mockResolvedValue([])

    const ctx = buildCtx({ appUserId: 'user-1', text: '/budget' })
    const result = await handleBudgetCommand(ctx)

    expect(result.text).toContain('🔴')
    expect(result.text).toContain('Đã vượt 120%')
  })
})
