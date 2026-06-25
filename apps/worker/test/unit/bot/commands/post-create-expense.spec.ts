/**
 * Unit tests for the post-create handlers (feat-121).
 *
 * Covers:
 * - `handlePostCreateHousehold` — renders the household picker on the same message
 * - `handlePostCreateApply`     — assigns a household (or resets to personal)
 * - `handlePostCreateDelete`    — soft-deletes and edits to "Đã xoá"
 *
 * Each handler re-loads the expense and verifies `spent_by_user_id`
 * matches the calling app user, so a stolen expenseId cannot mutate
 * someone else's row. The tests assert that ownership check fires.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const {
  mockFindExpenseByIdRaw,
  mockUpdateExpenseHousehold,
  mockSoftDeleteExpense,
  mockListActiveHouseholdIdsForUser,
  mockFindHouseholdById,
  mockCreateAuditLogEntry,
} = vi.hoisted(() => ({
  mockFindExpenseByIdRaw: vi.fn(),
  mockUpdateExpenseHousehold: vi.fn(),
  mockSoftDeleteExpense: vi.fn(),
  mockListActiveHouseholdIdsForUser: vi.fn(),
  mockFindHouseholdById: vi.fn(),
  mockCreateAuditLogEntry: vi.fn(),
}))

vi.mock('@/db/repositories/expense-repository', () => ({
  findExpenseByIdRaw: mockFindExpenseByIdRaw,
  updateExpenseHousehold: mockUpdateExpenseHousehold,
  softDeleteExpense: mockSoftDeleteExpense,
}))

vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: mockListActiveHouseholdIdsForUser,
}))

vi.mock('@/db/repositories/household-repository', () => ({
  findHouseholdById: mockFindHouseholdById,
}))

vi.mock('@/db/repositories/audit-log-repository', () => ({
  createAuditLogEntry: mockCreateAuditLogEntry,
}))

// ── Imports under test ───────────────────────────────────────────────────────
import { handlePostCreateApply } from '@/bot/commands/post-create-apply'
import { handlePostCreateDelete } from '@/bot/commands/post-create-delete'
import { handlePostCreateHousehold } from '@/bot/commands/post-create-household'
import type { CommandContext } from '@/bot/types'

// ── Helpers ──────────────────────────────────────────────────────────────────
const buildCtx = (appUserId: string | null = 'app-user-1'): CommandContext =>
  ({
    userId: 200,
    chatId: 100,
    userDisplayName: 'Tùng',
    text: 'callback-data',
    appUserId,
    locale: 'vi',
    db: {} as D1Database,
    telegramBotTmaUrl: 'https://tma.example.com',
    telegramBotDeepLinkUrl: 'https://t.me/bot',
  }) as CommandContext

const buildExpense = (
  overrides: Partial<{
    id: string
    spentByUserId: string
    householdId: string | null
    categoryKey: string
    sourceKey: string
    title: string
    amountMinor: number
    currencyCode: string
    occurredAt: number
  }> = {},
) => ({
  id: overrides.id ?? 'exp-1',
  spentByUserId: overrides.spentByUserId ?? 'app-user-1',
  householdId: overrides.householdId ?? null,
  categoryKey: overrides.categoryKey ?? 'food',
  sourceKey: overrides.sourceKey ?? 'cash',
  categoryId: null,
  amountMinor: overrides.amountMinor ?? 30_000_000,
  currencyCode: overrides.currencyCode ?? 'VND',
  occurredAt: overrides.occurredAt ?? Date.parse('2026-06-25T00:00:00Z'),
  title: overrides.title ?? 'ăn bún',
  note: null,
  deletedAt: null,
  createdViaBot: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

// ── Suite ────────────────────────────────────────────────────────────────────

describe('handlePostCreateHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListActiveHouseholdIdsForUser.mockResolvedValue(['hh-1', 'hh-2'])
    mockFindHouseholdById.mockImplementation(async (_db, id: string) =>
      id === 'hh-1'
        ? { id: 'hh-1', name: 'Gia đình A' }
        : id === 'hh-2'
          ? { id: 'hh-2', name: 'Gia đình B' }
          : null,
    )
    mockCreateAuditLogEntry.mockResolvedValue(undefined)
  })

  it('returns a no-access error when appUserId is missing', async () => {
    const result = await handlePostCreateHousehold(buildCtx(null), 'exp-1', 42)

    expect(result.mode).toBe('edit')
    expect(result.text).toMatch(/hết/)
  })

  it('rejects the tap when the expense does not exist', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(null)

    const result = await handlePostCreateHousehold(buildCtx(), 'exp-1', 42)

    expect(result.mode).toBe('edit')
    expect(result.text).toMatch(/Không tìm thấy/)
  })

  it('rejects the tap when the expense belongs to a different user', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(
      buildExpense({ spentByUserId: 'attacker' }),
    )

    const result = await handlePostCreateHousehold(buildCtx(), 'exp-1', 42)

    expect(result.mode).toBe('edit')
    expect(result.text).toMatch(/Không tìm thấy/)
  })

  it('returns a friendly note when the user has zero households', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())
    mockListActiveHouseholdIdsForUser.mockResolvedValueOnce([])

    const result = await handlePostCreateHousehold(buildCtx(), 'exp-1', 42)

    expect(result.mode).toBe('edit')
    expect(result.text).toMatch(/cá nhân/)
  })

  it('edits the message in place to a household picker', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())

    const result = await handlePostCreateHousehold(buildCtx(), 'exp-1', 42)

    expect(result.mode).toBe('edit')
    expect(result.targetMessageId).toBe(42)
    expect(result.text).toMatch(/Chọn phạm vi/)
    const rows = (result.replyMarkup as { inline_keyboard: unknown[][] })
      .inline_keyboard
    const labels = rows.flat().map((b) => (b as { text: string }).text)
    expect(labels).toContain('👤 Cá nhân')
    expect(labels).toContain('🏠 Gia đình A')
    expect(labels).toContain('🏠 Gia đình B')
    const callbacks = rows
      .flat()
      .map((b) => (b as { callback_data?: string }).callback_data)
    expect(callbacks).toContain('ch_apply:exp-1:personal')
    expect(callbacks).toContain('ch_apply:exp-1:hh-1')
    expect(callbacks).toContain('ch_apply:exp-1:hh-2')
  })
})

describe('handlePostCreateApply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListActiveHouseholdIdsForUser.mockResolvedValue(['hh-1'])
    mockFindHouseholdById.mockResolvedValue({
      id: 'hh-1',
      name: 'Gia đình A',
      defaultCurrencyCode: 'VND',
    })
    mockUpdateExpenseHousehold.mockImplementation(
      async (_db, _id, householdId, currencyCode) =>
        buildExpense({ householdId, currencyCode }),
    )
    mockCreateAuditLogEntry.mockResolvedValue(undefined)
  })

  it('assigns the household and edits the message to the full preview', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())

    const result = await handlePostCreateApply(buildCtx(), 'exp-1', 'hh-1', 42)

    expect(mockUpdateExpenseHousehold).toHaveBeenCalledWith(
      {},
      'exp-1',
      'hh-1',
      'VND',
    )
    expect(result.mode).toBe('edit')
    expect(result.text).toMatch(/Gia đình A/)
  })

  it('rejects the tap when the user is not a member of the household', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())
    mockListActiveHouseholdIdsForUser.mockResolvedValueOnce([])

    const result = await handlePostCreateApply(buildCtx(), 'exp-1', 'hh-1', 42)

    expect(mockUpdateExpenseHousehold).not.toHaveBeenCalled()
    expect(result.text).toMatch(/quyền/)
  })

  it('falls back to personal + ✅ summary when the user picks "personal"', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(
      buildExpense({ householdId: 'hh-1' }),
    )
    mockUpdateExpenseHousehold.mockResolvedValueOnce(
      buildExpense({ householdId: null }),
    )

    const result = await handlePostCreateApply(
      buildCtx(),
      'exp-1',
      'personal',
      42,
    )

    expect(mockUpdateExpenseHousehold).toHaveBeenCalledWith(
      {},
      'exp-1',
      null,
      'VND',
    )
    expect(result.text).toMatch(/^✅ /)
  })

  it('writes an expense.updated audit log with naturalInput:true', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())
    mockUpdateExpenseHousehold.mockResolvedValueOnce(
      buildExpense({ householdId: 'hh-1' }),
    )

    await handlePostCreateApply(buildCtx(), 'exp-1', 'hh-1', 42)

    expect(mockCreateAuditLogEntry).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(
      (mockCreateAuditLogEntry.mock.calls[0]![1] as { payloadJson: string })
        .payloadJson,
    )
    expect(payload).toMatchObject({
      source: 'telegram_bot',
      naturalInput: true,
      field: 'household_id',
      nextHouseholdId: 'hh-1',
    })
  })

  // Regression: bot natural-input amounts are always parsed as VND and
  // stored in VND minor units. When the target household defaults to a
  // non-VND currency, we must not flip currency_code to that default
  // — the amount_minor would then be misinterpreted (e.g. 30_000_000
  // minor units read as $300,000.00 instead of 30,000 VND). Without an
  // FX rate the safe behavior is to keep currency_code = 'VND'.
  it('keeps currency_code = VND when the household default is non-VND', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())
    mockFindHouseholdById.mockResolvedValueOnce({
      id: 'hh-1',
      name: 'Family Trip',
      defaultCurrencyCode: 'USD',
    })
    mockUpdateExpenseHousehold.mockResolvedValueOnce(
      buildExpense({ householdId: 'hh-1', currencyCode: 'VND' }),
    )

    const result = await handlePostCreateApply(buildCtx(), 'exp-1', 'hh-1', 42)

    expect(mockUpdateExpenseHousehold).toHaveBeenCalledWith(
      {},
      'exp-1',
      'hh-1',
      'VND',
    )
    expect(result.text).toMatch(/Family Trip/)
    expect(result.text).not.toMatch(/USD|\$/)
  })
})

describe('handlePostCreateDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSoftDeleteExpense.mockResolvedValue(true)
    mockCreateAuditLogEntry.mockResolvedValue(undefined)
  })

  it('soft-deletes and edits the message to "Đã xoá — <summary>"', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())

    const result = await handlePostCreateDelete(buildCtx(), 'exp-1', 42)

    expect(mockSoftDeleteExpense).toHaveBeenCalledWith({}, 'exp-1')
    expect(result.mode).toBe('edit')
    expect(result.text).toMatch(/^🗑 Đã xoá — /)
    expect(result.replyMarkup).toBeUndefined()
  })

  it('rejects the tap when the expense belongs to a different user', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(
      buildExpense({ spentByUserId: 'attacker' }),
    )

    const result = await handlePostCreateDelete(buildCtx(), 'exp-1', 42)

    expect(mockSoftDeleteExpense).not.toHaveBeenCalled()
    expect(result.text).toMatch(/Không tìm thấy/)
  })

  it('writes an expense.deleted audit log with naturalInputUndo:true', async () => {
    mockFindExpenseByIdRaw.mockResolvedValueOnce(buildExpense())

    await handlePostCreateDelete(buildCtx(), 'exp-1', 42)

    expect(mockCreateAuditLogEntry).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(
      (mockCreateAuditLogEntry.mock.calls[0]![1] as { payloadJson: string })
        .payloadJson,
    )
    expect(payload).toMatchObject({
      source: 'telegram_bot',
      naturalInputUndo: true,
    })
  })
})
