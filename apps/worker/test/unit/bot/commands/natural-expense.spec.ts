/**
 * Unit tests for the natural-input direct-create flow (feat-121, feat-135).
 *
 * feat-135 follow-up: single grouped summary edit (loader → ✅ Đã thêm N khoản)
 * pure text, no keyboard. Batch capped to 10.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const {
  mockParseExpensesWithAi,
  mockCreateExpense,
  mockCreateAuditLogEntry,
  mockSendMessage,
  mockEditMessageText,
  mockGetMinorUnits,
  mockFetchAiContext,
} = vi.hoisted(() => ({
  mockParseExpensesWithAi: vi.fn(),
  mockCreateExpense: vi.fn(),
  mockCreateAuditLogEntry: vi.fn(),
  mockSendMessage: vi.fn(),
  mockEditMessageText: vi.fn(),
  mockGetMinorUnits: vi.fn().mockReturnValue(30_000_000), // 30,000₫ in VND = 30_000_000 minor
  mockFetchAiContext: vi.fn().mockResolvedValue({
    availableHouseholds: [],
    availableGroups: [],
    householdNameToId: new Map(),
    groupNameToId: new Map(),
    groupIdToHouseholdId: new Map(),
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

vi.mock('@/lib/ai/household-context', () => ({
  fetchAiContext: mockFetchAiContext,
  mapAiNamesToIds: (
    _raw: unknown,
    _maps: unknown,
    _counters: unknown,
    _opts?: unknown,
  ) => ({ householdId: null, groupIds: [] }),
}))

vi.mock('@/lib/currency', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/currency')>('@/lib/currency')

  return {
    ...actual,
    getMinorUnits: mockGetMinorUnits,
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

describe('runNaturalExpenseCreate (feat-135)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMinorUnits.mockReturnValue(30_000_000)
    mockFetchAiContext.mockResolvedValue({
      availableHouseholds: [],
      availableGroups: [],
      householdNameToId: new Map(),
      groupNameToId: new Map(),
      groupIdToHouseholdId: new Map(),
    })
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

    const handled = await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k'),
      'app-user-1',
    )

    expect(handled).toBe(1)
    expect(mockCreateExpense).toHaveBeenCalledTimes(1)
    expect(mockSendMessage).toHaveBeenCalledTimes(1) // loader
    expect(mockEditMessageText).toHaveBeenCalledTimes(1) // loader → ✅ grouped summary
    expect(mockSendMessage).toHaveBeenCalledWith(
      100,
      expect.stringContaining('Phân tích'),
    )
    const editCall = mockEditMessageText.mock.calls[0]!
    expect(editCall[2]).toMatch(/^✅ Đã thêm 1 khoản/)
    // pure text: no keyboard
    const opts = editCall[3] as {
      parseMode?: string
      replyMarkup?: {
        inline_keyboard: Array<Array<{ text: string; callback_data: string }>>
      }
    }
    expect(opts.parseMode).toBe('HTML')
    expect(opts.replyMarkup).toBeUndefined()
  })

  it('creates N expenses and edits loader once with grouped summary (feat-135)', async () => {
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

    // feat-135: single grouped edit, no per-item messages
    expect(handled).toBe(1)
    expect(mockCreateExpense).toHaveBeenCalledTimes(3)
    expect(mockSendMessage).toHaveBeenCalledTimes(1) // only loader
    expect(mockEditMessageText).toHaveBeenCalledTimes(1)
    const editCall = mockEditMessageText.mock.calls[0]!
    expect(editCall[2]).toMatch(/^✅ Đã thêm 3 khoản/)
    const opts = editCall[3] as {
      parseMode?: string
      replyMarkup?: {
        inline_keyboard: Array<Array<{ text: string; callback_data: string }>>
      }
    }
    expect(opts.parseMode).toBe('HTML')
    expect(opts.replyMarkup).toBeUndefined()
  })

  it('uses each parsed item amount when creating multiple natural expenses', async () => {
    mockGetMinorUnits.mockImplementation((amount: number) => amount)
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

    await runNaturalExpenseCreate(
      buildDeps(),
      buildClient(),
      buildMessage('ăn bún 30k, cà phê 25k, đổ xăng 50k'),
      'app-user-1',
    )

    const amountMinorByExpense = mockCreateExpense.mock.calls.map((call) => {
      const input = call[1] as { amountMinor: number }
      return input.amountMinor
    })

    expect(amountMinorByExpense).toEqual([30000, 25000, 50000])
    expect(mockGetMinorUnits).toHaveBeenNthCalledWith(1, 30000, 'VND')
    expect(mockGetMinorUnits).toHaveBeenNthCalledWith(2, 25000, 'VND')
    expect(mockGetMinorUnits).toHaveBeenNthCalledWith(3, 50000, 'VND')
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

  it('renders pure text with no keyboard (feat-135 follow-up)', async () => {
    mockParseExpensesWithAi.mockResolvedValue([
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

    const editCall = mockEditMessageText.mock.calls[0]!
    const opts = editCall[3] as {
      parseMode?: string
      replyMarkup?: {
        inline_keyboard: Array<Array<{ text: string; callback_data: string }>>
      }
    }
    expect(opts.parseMode).toBe('HTML')
    expect(opts.replyMarkup).toBeUndefined()
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

  describe('household suffix integration', () => {
    it('createNaturalExpenses includes 🏠 when householdNameById provided', async () => {
      const { createNaturalExpenses } =
        await import('@/bot/commands/natural-expense-helpers')
      const result = await createNaturalExpenses({
        db: {} as D1Database,
        appUserId: 'u1',
        validItems: [
          {
            amount: 50000,
            categoryKey: 'food',
            sourceKey: 'cash',
            title: 'test title',
            occurredAt: '2026-06-24',
          } as never,
        ],
        aiMappings: [{ householdId: 'hh-1', groupIds: [] }],
        amountResult: { amountVnd: 50000, matched: '50k' },
        correlationId: 'test',
        text: 'test 50k',
        householdNameById: new Map([['hh-1', 'Gia đình tôi']]),
      })
      expect(result[0]?.summary).toContain('🏠 Gia đình tôi')
    })
  })
})
