/**
 * Unit tests for the post-create handler (feat-135).
 *
 * Only ch_delete remains: native single-message grouped summary with stacked
 * 🗑 Xoá buttons. Household picker (ch_household / ch_apply) was removed.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const {
  mockFindExpenseByIdRaw,
  mockSoftDeleteExpense,
  mockCreateAuditLogEntry,
} = vi.hoisted(() => ({
  mockFindExpenseByIdRaw: vi.fn(),
  mockSoftDeleteExpense: vi.fn(),
  mockCreateAuditLogEntry: vi.fn(),
}))

vi.mock('@/db/repositories/expense-repository', () => ({
  findExpenseByIdRaw: mockFindExpenseByIdRaw,
  softDeleteExpense: mockSoftDeleteExpense,
}))

vi.mock('@/db/repositories/audit-log-repository', () => ({
  createAuditLogEntry: mockCreateAuditLogEntry,
}))

// ── Imports under test ───────────────────────────────────────────────────────
import { handlePostCreateDelete } from '@/bot/commands/post-create-delete'
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
