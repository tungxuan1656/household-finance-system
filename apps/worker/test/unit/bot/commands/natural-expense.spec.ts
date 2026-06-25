/**
 * Unit tests for the natural-input direct-create flow (feat-121).
 *
 * `runNaturalExpenseCreate` orchestrates a sequence of side effects:
 * - amount detector
 * - AI parser
 * - household-membership lookup (to decide whether to show the 🏠 button)
 * - per-item expense creation + audit log
 * - Telegram sendMessage / editMessageText
 *
 * All external collaborators are mocked so the test focuses on the
 * control flow: how many expenses are created, what the messages look
 * like, and what happens on edge cases.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const {
  mockParseExpensesWithAi,
  mockCreateExpense,
  mockCreateAuditLogEntry,
  mockListActiveHouseholdIdsForUser,
  mockSendMessage,
  mockEditMessageText,
  mockGetMinorUnits,
  mockPostCreateKeyboard,
} = vi.hoisted(() => ({
  mockParseExpensesWithAi: vi.fn(),
  mockCreateExpense: vi.fn(),
  mockCreateAuditLogEntry: vi.fn(),
  mockListActiveHouseholdIdsForUser: vi.fn(),
  mockSendMessage: vi.fn(),
  mockEditMessageText: vi.fn(),
  mockGetMinorUnits: vi.fn().mockReturnValue(30_000_000), // 30,000₫ in VND = 30_000_000 minor
  mockPostCreateKeyboard: vi.fn().mockReturnValue({
    inline_keyboard: [[{ text: '🗑 Xoá', callback_data: 'ch_delete:exp-1' }]],
  }),
}))

vi.mock('@/lib/ai/expense-parser', () => ({
  AiUpstreamError: class AiUpstreamError extends Error {
    constructor() {
      super('AI upstream service failure')
      this.name = 'AiUpstreamError'
    }
  },
  parseExpensesWithAi: mockParseExpensesWithAi,
}))

vi.mock('@/db/repositories/expense-repository', () => ({
  createExpense: mockCreateExpense,
}))

vi.mock('@/db/repositories/audit-log-repository', () => ({
  createAuditLogEntry: mockCreateAuditLogEntry,
}))

vi.mock('@/db/repositories/household-membership-repository', () => ({
  listActiveHouseholdIdsForUser: mockListActiveHouseholdIdsForUser,
}))

vi.mock('@/lib/currency', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/currency')>('@/lib/currency')

  return {
    ...actual,
    getMinorUnits: mockGetMinorUnits,
  }
})

vi.mock('@/bot/renderers/keyboards', async () => {
  const actual = await vi.importActual<
    typeof import('@/bot/renderers/keyboards')
  >('@/bot/renderers/keyboards')

  return {
    ...actual,
    postCreateKeyboard: mockPostCreateKeyboard,
  }
})

// ── Imports under test ───────────────────────────────────────────────────────
import { AiUpstreamError } from '@/lib/ai/expense-parser'
import { runNaturalExpenseCreate } from '@/bot/commands/natural-expense'
import type { BotServiceDeps } from '@/bot/callback-dispatcher'
import type { TelegramClient } from '@/bot/telegram-client'
import type { TelegramMessage, TelegramUser } from '@/bot/types'

// ── Helpers ──────────────────────────────────────────────────────────────────
const buildDeps = (): BotServiceDeps =>
  ({
    db: {} as D1Database,
    config: {
      telegramBotToken: 'test',
      telegramBotTmaUrl: 'https://tma.example.com',
      telegramBotDeepLinkUrl: 'https://t.me/bot',
    },
    env: {
      OPENAI_COMPAT_BASE_URL: 'https://ai.example.com',
      OPENAI_COMPAT_API_KEY: 'test-key',
      OPENAI_COMPAT_MODEL: 'test-model',
    },
  }) as BotServiceDeps

const buildClient = (): TelegramClient =>
  ({
    sendMessage: mockSendMessage,
    editMessageText: mockEditMessageText,
  }) as unknown as TelegramClient

const buildMessage = (text: string): TelegramMessage & { from: TelegramUser } =>
  ({
    message_id: 42,
    chat: { id: 100, type: 'private' },
    from: { id: 200, is_bot: false, first_name: 'Tùng' },
    text,
    date: 1_700_000_000,
  }) as TelegramMessage & { from: TelegramUser }

// ── Suite ────────────────────────────────────────────────────────────────────

describe('runNaturalExpenseCreate (feat-121)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMinorUnits.mockReturnValue(30_000_000)
    mockPostCreateKeyboard.mockReturnValue({
      inline_keyboard: [[{ text: '🗑 Xoá', callback_data: 'ch_delete:exp-1' }]],
    })
    mockListActiveHouseholdIdsForUser.mockResolvedValue([])
    mockCreateExpense.mockImplementation(async (_db, input) => ({
      id: input.id,
      householdId: input.householdId,
      spentByUserId: input.spentByUserId,
      categoryKey: input.categoryKey,
      sourceKey: input.sourceKey,
      categoryId: input.categoryId ?? null,
      amountMinor: input.amountMinor,
      currencyCode: input.currencyCode,
      occurredAt: input.occurredAt,
      title: input.title,
      note: input.note ?? null,
      deletedAt: null,
      createdViaBot: input.createdViaBot ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }))
    mockCreateAuditLogEntry.mockResolvedValue(undefined)
    mockSendMessage.mockResolvedValue(500)
    mockEditMessageText.mockResolvedValue({} as Response)
  })

  it('returns 0 when the text does not look like an expense', async () => {
    mockParseExpensesWithAi.mockResolvedValue([])

    const handled = await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('hello there'),
      'app-user-1',
    )

    expect(handled).toBe(0)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('creates one expense and edits the loader when AI returns a single valid item', async () => {
    mockParseExpensesWithAi.mockResolvedValue([
      {
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'ăn bún',
        occurredAt: '2026-06-25',
      },
    ])
    mockListActiveHouseholdIdsForUser.mockResolvedValue(['hh-1'])

    const handled = await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(handled).toBe(1)
    expect(mockCreateExpense).toHaveBeenCalledTimes(1)
    expect(mockSendMessage).toHaveBeenCalledTimes(1) // loader
    expect(mockEditMessageText).toHaveBeenCalledTimes(1) // loader → ✅ summary
    expect(mockSendMessage).toHaveBeenCalledWith(
      100,
      expect.stringContaining('Phân tích'),
    )
    const editCall = mockEditMessageText.mock.calls[0]!
    expect(editCall[2]).toMatch(/^✅ /)
  })

  it('creates N expenses and sends one message per item when AI returns N valid items', async () => {
    mockParseExpensesWithAi.mockResolvedValue([
      {
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'ăn bún',
        occurredAt: '2026-06-25',
      },
      {
        amount: 25000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'cà phê',
        occurredAt: '2026-06-25',
      },
      {
        amount: 50000,
        categoryKey: 'transport',
        sourceKey: 'cash',
        title: 'xăng',
        occurredAt: '2026-06-25',
      },
    ])

    const handled = await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k, cà phê 25k, đổ xăng 50k'),
      'app-user-1',
    )

    // loader (1) + 2 extra messages for items 2 and 3
    expect(handled).toBe(3)
    expect(mockCreateExpense).toHaveBeenCalledTimes(3)
    expect(mockSendMessage).toHaveBeenCalledTimes(1 + 2)
    expect(mockEditMessageText).toHaveBeenCalledTimes(1)
  })

  it('passes the detected amount (not the AI amount) to the expense', async () => {
    // AI returns a wildly wrong amount; the detector should win.
    mockParseExpensesWithAi.mockResolvedValue([
      {
        amount: 999_999_999,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'ăn bún',
        occurredAt: '2026-06-25',
      },
    ])

    await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    const createCall = mockCreateExpense.mock.calls[0]!
    const input = createCall[1] as { amountMinor: number; currencyCode: string }
    expect(input.currencyCode).toBe('VND')
    expect(input.amountMinor).toBe(30_000_000) // 30,000₫ in VND
  })

  it('edits the loader to INPUT_UNRECOGNIZED_TEXT when no item is valid', async () => {
    mockParseExpensesWithAi.mockResolvedValue([
      {
        amount: -5, // invalid
        categoryKey: '',
        title: '',
        occurredAt: 'bad-date',
      },
    ])

    const handled = await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(handled).toBe(1)
    expect(mockCreateExpense).not.toHaveBeenCalled()
    expect(mockEditMessageText).toHaveBeenCalledWith(
      100,
      500,
      expect.stringContaining('Không nhận diện'),
      { parseMode: 'HTML' },
    )
  })

  it('edits the loader to AI_UNAVAILABLE_TEXT on upstream failure', async () => {
    mockParseExpensesWithAi.mockRejectedValue(new AiUpstreamError())

    const handled = await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(handled).toBe(1)
    expect(mockCreateExpense).not.toHaveBeenCalled()
    expect(mockEditMessageText).toHaveBeenCalledWith(
      100,
      500,
      expect.stringContaining('AI tạm không khả dụng'),
      { parseMode: 'HTML' },
    )
  })

  it('shows the household button when the user has households', async () => {
    mockParseExpensesWithAi.mockResolvedValue([
      {
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'ăn bún',
        occurredAt: '2026-06-25',
      },
    ])
    mockListActiveHouseholdIdsForUser.mockResolvedValue(['hh-1', 'hh-2'])

    await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(mockPostCreateKeyboard).toHaveBeenCalledWith(
      expect.any(String),
      true,
    )
  })

  it('hides the household button when the user has zero households', async () => {
    mockParseExpensesWithAi.mockResolvedValue([
      {
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'ăn bún',
        occurredAt: '2026-06-25',
      },
    ])
    mockListActiveHouseholdIdsForUser.mockResolvedValue([])

    await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(mockPostCreateKeyboard).toHaveBeenCalledWith(
      expect.any(String),
      false,
    )
  })

  it('writes an expense.created audit log with naturalInput:true', async () => {
    mockParseExpensesWithAi.mockResolvedValueOnce([
      {
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'ăn bún',
        occurredAt: '2026-06-25',
      },
    ])

    await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(mockCreateAuditLogEntry).toHaveBeenCalledTimes(1)
    const call = mockCreateAuditLogEntry.mock.calls[0]!
    const input = call[1] as {
      actionType: string
      payloadJson: string
    }
    expect(input.actionType).toBe('expense.created')
    expect(JSON.parse(input.payloadJson)).toMatchObject({
      source: 'telegram_bot',
      naturalInput: true,
    })
  })

  it('returns 0 when AI config env vars are missing', async () => {
    const deps = buildDeps()
    deps.env = {}

    const handled = await runNaturalExpenseCreate(
      deps,
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(handled).toBe(0)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})
