import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  handleCancelExpense,
  handleConfirmExpense,
  handleRetryExpense,
} from '@/bot/commands/confirm-expense'
import { handleHouseholdSelect } from '@/bot/commands/household-select'
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
  text: 'confirm:draft-abc-123',
  appUserId: 'user-1',
  locale: 'vi',
  db: mockDb,
  telegramBotTmaUrl: 'https://phofis-tma.pages.dev/',
  telegramBotDeepLinkUrl: 'https://t.me/phofis_bot',
  ...overrides,
})

const TEST_DEDUPE_KEY = 'dedupe-key'

const pendingDraft = {
  id: 'draft-abc-123',
  telegramUserId: '123456789',
  telegramChatId: '987654321',
  dedupeKey: TEST_DEDUPE_KEY,
  previewJson: JSON.stringify({
    amountMinor: 3000000, // 30k VND in minor units
    occurredAt: '2026-06-15',
    categoryKey: 'food',
    title: 'ăn bún',
    sourceKey: 'bank-transfer',
    scope: 'personal',
  }),
  status: 'pending',
  createdExpenseId: null,
  locale: 'vi',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const confirmedDraft = {
  ...pendingDraft,
  status: 'confirmed',
  createdExpenseId: 'expense-123',
}

// Mock draft repository
vi.mock('@/db/repositories/telegram-bot-expense-draft-repository', () => ({
  findDraftById: vi.fn(),
  isDraftExpired: vi.fn().mockReturnValue(false),
  expireDraft: vi.fn().mockResolvedValue(undefined),
  markDraftConfirmed: vi.fn().mockResolvedValue(null),
  upsertDraft: vi.fn().mockResolvedValue(null),
  claimDraftForConfirm: vi.fn().mockResolvedValue(true),
}))

// Mock expense repository
vi.mock('@/db/repositories/expense-repository', () => ({
  createExpense: vi.fn(),
}))

// Mock audit log
vi.mock('@/db/repositories/audit-log-repository', () => ({
  createAuditLogEntry: vi.fn().mockResolvedValue(undefined),
}))

// Mock household membership (needed by confirm and household-select)
vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: vi.fn().mockResolvedValue(['hh-1']),
}))

// Mock household
vi.mock('@/db/repositories/household-repository', () => ({
  findHouseholdById: vi.fn().mockResolvedValue({
    id: 'hh-1',
    name: 'Gia đình Test',
    defaultCurrencyCode: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    createdAt: 0,
  }),
}))

describe('handleConfirmExpense', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unlinked guidance when appUserId is null', async () => {
    const ctx = buildCtx({ appUserId: null })
    const result = await handleConfirmExpense(ctx, 'draft-abc')

    expect(result.text).toContain('Mở Mini App')
  })

  it('returns not found when draft does not exist', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    vi.mocked(draftModule.findDraftById).mockResolvedValue(null)

    const ctx = buildCtx()
    const result = await handleConfirmExpense(ctx, 'nonexistent')

    expect(result.text).toContain('Không tìm thấy')
  })

  it('returns expired error when draft is too old', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)
    vi.mocked(draftModule.isDraftExpired).mockReturnValue(true)

    const ctx = buildCtx()
    const result = await handleConfirmExpense(ctx, 'draft-abc-123')

    expect(result.text).toContain('hết hạn')
  })

  it('returns already-created response when draft already confirmed (idempotent)', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    vi.mocked(draftModule.findDraftById).mockResolvedValue(confirmedDraft)
    vi.mocked(draftModule.isDraftExpired).mockReturnValue(false)

    const ctx = buildCtx()
    const result = await handleConfirmExpense(ctx, 'draft-abc-123')

    expect(result.text).toContain('đã được thêm trước đó')
    expect(result.text).toContain('expense-123')
  })

  it('creates expense with created_via_bot=1 and marks draft confirmed', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    const expenseModule = await import('@/db/repositories/expense-repository')
    const auditModule = await import('@/db/repositories/audit-log-repository')

    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)
    vi.mocked(draftModule.isDraftExpired).mockReturnValue(false)
    vi.mocked(expenseModule.createExpense).mockResolvedValue({
      id: 'expense-new-1',
      householdId: null,
      spentByUserId: 'user-1',
      categoryKey: 'food',
      sourceKey: 'bank-transfer',
      categoryId: null,
      amountMinor: 30000,
      currencyCode: 'VND',
      occurredAt: Date.parse('2026-06-15'),
      title: 'ăn bún',
      note: 'Tạo qua Telegram bot',
      deletedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdViaBot: 1,
    })

    const ctx = buildCtx()
    const result = await handleConfirmExpense(ctx, 'draft-abc-123')

    expect(result.text).toContain('Đã thêm chi tiêu thành công')

    // Verify created_via_bot=1
    expect(
      vi.mocked(expenseModule.createExpense).mock.calls[0][1].createdViaBot,
    ).toBe(1)

    // Verify audit log written
    expect(vi.mocked(auditModule.createAuditLogEntry).mock.calls.length).toBe(1)
    const auditCall = vi.mocked(auditModule.createAuditLogEntry).mock
      .calls[0][1]
    expect(auditCall.actionType).toBe('expense.created')
    expect(JSON.parse(auditCall.payloadJson)).toEqual({
      source: 'telegram_bot',
      expenseId: 'expense-new-1',
    })

    // Verify draft marked confirmed
    expect(vi.mocked(draftModule.markDraftConfirmed).mock.calls.length).toBe(1)
  })

  it('rejects confirm for household scope when user is not a member (B2)', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    const membershipModule =
      await import('@/db/repositories/household-membership-repository')

    const householdDraft = {
      ...pendingDraft,
      previewJson: JSON.stringify({
        ...JSON.parse(pendingDraft.previewJson),
        scope: 'household',
        householdId: 'hh-forbidden',
        householdName: 'Gia đình Xa Lạ',
      }),
    }

    vi.mocked(draftModule.findDraftById).mockResolvedValue(householdDraft)
    vi.mocked(draftModule.isDraftExpired).mockReturnValue(false)
    // User is only a member of hh-1, not hh-forbidden
    vi.mocked(membershipModule.listActiveHouseholdIdsForUser).mockResolvedValue(
      ['hh-1'],
    )

    const ctx = buildCtx()
    const result = await handleConfirmExpense(ctx, 'draft-abc-123')

    expect(result.text).toContain('không có quyền')
  })

  it('returns success keyboard with add another and open app buttons', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    const expenseModule = await import('@/db/repositories/expense-repository')

    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)
    vi.mocked(draftModule.isDraftExpired).mockReturnValue(false)
    vi.mocked(expenseModule.createExpense).mockResolvedValue({
      id: 'expense-new-2',
      householdId: null,
      spentByUserId: 'user-1',
      categoryKey: 'food',
      sourceKey: 'bank-transfer',
      categoryId: null,
      amountMinor: 30000,
      currencyCode: 'VND',
      occurredAt: Date.parse('2026-06-15'),
      title: 'ăn bún',
      note: 'Tạo qua Telegram bot',
      deletedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdViaBot: 1,
    })

    const ctx = buildCtx()
    const result = await handleConfirmExpense(ctx, 'draft-abc-123')

    expect(result.replyMarkup).toBeDefined()
    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('➕ Thêm khoản khác')
      expect(labels).toContain('🏠 Mở Mini App')
    }
  })
})

describe('handleCancelExpense', () => {
  it('cancels pending draft', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)

    const ctx = buildCtx()
    const result = await handleCancelExpense(ctx, 'draft-abc-123')

    expect(result.text).toContain('Đã hủy')
  })
})

describe('handleHouseholdSelect', () => {
  it('switches to personal scope', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)

    const ctx = buildCtx()
    const result = await handleHouseholdSelect(ctx, 'draft-abc-123', 'personal')

    expect(result.text).toContain('Cá nhân')
  })

  it('switches to household scope', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)

    const ctx = buildCtx()
    const result = await handleHouseholdSelect(ctx, 'draft-abc-123', 'hh-1')

    expect(result.text).toContain('Gia đình Test')
  })

  it('shows household selection keyboard when payload is empty (B1)', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    const membershipModule =
      await import('@/db/repositories/household-membership-repository')

    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)
    vi.mocked(membershipModule.listActiveHouseholdIdsForUser).mockResolvedValue(
      ['hh-1'],
    )

    const ctx = buildCtx()
    const result = await handleHouseholdSelect(ctx, 'draft-abc-123', '')

    expect(result.text).toContain('Chọn phạm vi')
    expect(result.replyMarkup).toBeDefined()

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('👤 Cá nhân')
      expect(labels).toContain('🏠 Gia đình Test')
    }
  })

  it('rejects non-member household selection (B2)', async () => {
    const draftModule =
      await import('@/db/repositories/telegram-bot-expense-draft-repository')
    const membershipModule =
      await import('@/db/repositories/household-membership-repository')

    vi.mocked(draftModule.findDraftById).mockResolvedValue(pendingDraft)
    vi.mocked(membershipModule.listActiveHouseholdIdsForUser).mockResolvedValue(
      ['hh-1', 'hh-2'],
    )

    const ctx = buildCtx()
    const result = await handleHouseholdSelect(
      ctx,
      'draft-abc-123',
      'hh-forbidden',
    )

    expect(result.text).toContain('không có quyền')
  })
})

describe('handleRetryExpense', () => {
  it('returns retry guidance', async () => {
    const result = await handleRetryExpense(buildCtx(), 'draft-abc-123')

    expect(result.text).toContain('/ai')
  })
})
