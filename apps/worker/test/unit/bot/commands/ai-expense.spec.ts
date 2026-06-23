import { describe, expect, it, vi, beforeEach } from 'vitest'

import { handleAiExpenseCommand } from '@/bot/commands/ai-expense'
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
  text: '/ai ăn bún 30k 15/6',
  appUserId: 'user-1',
  locale: 'vi',
  db: mockDb,
  env: {
    OPENAI_COMPAT_BASE_URL: 'https://api.openai.com',
    OPENAI_COMPAT_API_KEY: 'test-key',
    OPENAI_COMPAT_MODEL: 'gpt-4o-mini',
  },
  ...overrides,
})

// Mock AI parser
vi.mock('@/lib/ai/expense-parser', () => ({
  parseExpensesWithAi: vi.fn(),
  AiUpstreamError: class AiUpstreamError extends Error {
    constructor() {
      super('AI upstream service failure')
      this.name = 'AiUpstreamError'
    }
  },
}))

// Mock draft repository
vi.mock('@/db/repositories/telegram-bot-expense-draft-repository', () => ({
  createDraftFromPreview: vi.fn().mockResolvedValue({
    id: 'draft-abc-123',
    telegramUserId: '123456789',
    telegramChatId: '987654321',
    dedupeKey: 'dedupe-test-key',
    previewJson: JSON.stringify({
      amountMinor: 30000, // 30k VND in minor units (VND has 0 fraction digits)
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
  }),
  upsertDraft: vi.fn(),
  findDraftById: vi.fn(),
  markDraftConfirmed: vi.fn(),
  isDraftExpired: vi.fn(),
  expireDraft: vi.fn(),
}))

// Mock household membership
vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: vi.fn().mockResolvedValue([]),
}))

// Mock household repo
vi.mock('@/db/repositories/household-repository', () => ({
  findHouseholdById: vi.fn().mockResolvedValue(null),
}))

describe('handleAiExpenseCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unlinked guidance when appUserId is null', async () => {
    const ctx = buildCtx({ appUserId: null })
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('Mở Mini App')
  })

  it('returns help when no expense text provided', async () => {
    const ctx = buildCtx({ text: '/ai' })
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('Vui lòng nhập nội dung')
  })

  it('returns preview with confirm buttons for valid expense', async () => {
    const parserModule = await import('@/lib/ai/expense-parser')
    vi.mocked(parserModule.parseExpensesWithAi).mockResolvedValue([
      {
        amount: 30000,
        categoryKey: 'food',
        title: 'ăn bún',
        occurredAt: '2026-06-15',
      },
    ])

    const ctx = buildCtx()
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('Xem trước chi tiêu')
    expect(result.text).toContain('30.000')
    expect(result.text).toContain('Ăn uống')
    expect(result.text).toContain('2026-06-15')
    expect(result.text).toContain('ăn bún')
    expect(result.text).toContain('Cá nhân')
    expect(result.replyMarkup).toBeDefined()

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('✅ Thêm chi tiêu')
      expect(labels).toContain('🏠 Chọn household')
      expect(labels).toContain('🔁 Nhập lại')
      expect(labels).toContain('❌ Hủy')
    }
  })

  it('returns re-entry guidance when AI returns empty items', async () => {
    const parserModule = await import('@/lib/ai/expense-parser')
    vi.mocked(parserModule.parseExpensesWithAi).mockResolvedValue([])

    const ctx = buildCtx()
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('Không thể nhận diện chi tiêu')
  })

  it('returns re-entry guidance when AI returns invalid item (missing fields)', async () => {
    const parserModule = await import('@/lib/ai/expense-parser')
    vi.mocked(parserModule.parseExpensesWithAi).mockResolvedValue([
      { amount: 0, categoryKey: '', title: '', occurredAt: '' },
    ])

    const ctx = buildCtx()
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('Thiếu thông tin bắt buộc')
  })

  it('uses only first item when AI returns multiple expenses', async () => {
    const parserModule = await import('@/lib/ai/expense-parser')
    vi.mocked(parserModule.parseExpensesWithAi).mockResolvedValue([
      {
        amount: 30000,
        categoryKey: 'food',
        title: 'ăn bún',
        occurredAt: '2026-06-15',
      },
      {
        amount: 50000,
        categoryKey: 'transport',
        title: 'xe ôm',
        occurredAt: '2026-06-15',
      },
    ])

    const ctx = buildCtx()
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('Xem trước chi tiêu')
    expect(result.text).toContain('ăn bún')
    expect(result.text).toContain('Chỉ xử lý khoản chi tiêu đầu tiên')
    expect(result.text).not.toContain('xe ôm')
  })

  it('returns user-friendly error on AI upstream failure', async () => {
    const parserModule = await import('@/lib/ai/expense-parser')
    vi.mocked(parserModule.parseExpensesWithAi).mockRejectedValue(
      new parserModule.AiUpstreamError(),
    )

    const ctx = buildCtx()
    const result = await handleAiExpenseCommand(ctx)

    expect(result.text).toContain('không khả dụng')
  })
})
