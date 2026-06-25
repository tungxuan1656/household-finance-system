import { describe, expect, it, vi, beforeEach } from 'vitest'

import { buildDraftsFromItems } from '@/bot/commands/ai-expense-shared'
import type { CommandContext } from '@/bot/types'
import type { ParsedExpenseItem } from '@/contracts/expense-parse-schemas'

// ── Hoisted mocks ──────────────────────────────────────────────────────────────
const {
  mockCreateDraftFromPreview,
  mockRenderExpensePreviewText,
  mockExpensePreviewKeyboard,
} = vi.hoisted(() => ({
  mockCreateDraftFromPreview: vi.fn(),
  mockRenderExpensePreviewText: vi.fn().mockReturnValue('Preview text'),
  mockExpensePreviewKeyboard: vi.fn().mockReturnValue({ inline_keyboard: [] }),
}))

vi.mock('@/db/repositories/telegram-bot-expense-draft-repository', () => ({
  createDraftFromPreview: mockCreateDraftFromPreview,
}))

vi.mock('@/bot/format', () => ({
  renderExpensePreviewText: mockRenderExpensePreviewText,
}))

vi.mock('@/bot/renderers/keyboards', () => ({
  expensePreviewKeyboard: mockExpensePreviewKeyboard,
}))

// ── Helpers ────────────────────────────────────────────────────────────────────

const buildMockCtx = (
  overrides: Partial<CommandContext> = {},
): CommandContext => ({
  userId: 12345,
  chatId: 67890,
  userDisplayName: 'TestUser',
  text: '/add ...',
  appUserId: 'test-app-user-id',
  locale: 'vi',
  db: {} as D1Database,
  telegramBotTmaUrl: 'https://tma.example.com',
  telegramBotDeepLinkUrl: 'https://t.me/bot',
  ...overrides,
})

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('buildDraftsFromItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateDraftFromPreview.mockResolvedValue({
      id: 'draft-1',
      status: 'pending',
      createdExpenseId: null,
      telegramUserId: 'test-user',
      telegramChatId: 'test-chat',
      dedupeKey: 'ignored',
      previewJson: '{}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  })

  it('assigns different dedupeKeys for items with identical title, amount, and occurredAt', async () => {
    const ctx = buildMockCtx()

    // Two items that are identical in every field — only their array index differs
    const items: ParsedExpenseItem[] = [
      {
        title: 'Ăn trưa',
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'bank-transfer',
        occurredAt: '2025-06-25',
      },
      {
        title: 'Ăn trưa',
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'bank-transfer',
        occurredAt: '2025-06-25',
      },
    ]

    await buildDraftsFromItems(ctx, items, {
      rawText: '/add ăn trưa 50k, ăn trưa 50k',
      defaultDate: '2025-06-25',
    })

    expect(mockCreateDraftFromPreview).toHaveBeenCalledTimes(2)

    const dedupeKey0 = mockCreateDraftFromPreview.mock.calls[0]![0]!.dedupeKey
    const dedupeKey1 = mockCreateDraftFromPreview.mock.calls[1]![0]!.dedupeKey
    expect(dedupeKey0).not.toBe(dedupeKey1)
  })
})
