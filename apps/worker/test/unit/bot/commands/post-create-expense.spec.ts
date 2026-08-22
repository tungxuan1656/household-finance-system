/**
 * Unit tests for post-create pure text (feat-135 follow-up).
 *
 * Native chat is pure text with no keyboard. ch_delete removed;
 * old callbacks expire via fallback. No inline_keyboard on summary.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockFindAppUserIdByTelegramId,
  mockHandleBudgetCommand,
  mockHandlePreferenceToggle,
  mockHandleSettingsCommand,
  mockHandleStatsCommand,
} = vi.hoisted(() => ({
  mockFindAppUserIdByTelegramId: vi.fn(),
  mockHandleBudgetCommand: vi.fn(),
  mockHandlePreferenceToggle: vi.fn(),
  mockHandleSettingsCommand: vi.fn(),
  mockHandleStatsCommand: vi.fn(),
}))

vi.mock('@/bot/account-linking', () => ({
  findAppUserIdByTelegramId: mockFindAppUserIdByTelegramId,
}))

vi.mock('@/bot/commands/budget', () => ({
  handleBudgetCommand: mockHandleBudgetCommand,
}))

vi.mock('@/bot/commands/settings', () => ({
  handlePreferenceToggle: mockHandlePreferenceToggle,
  handleSettingsCommand: mockHandleSettingsCommand,
}))

vi.mock('@/bot/commands/stats', () => ({
  handleStatsCommand: mockHandleStatsCommand,
}))

import { handleCallbackQuery } from '@/bot/callback-dispatcher'
import type { BotServiceDeps } from '@/bot/callback-dispatcher'
import type { TelegramClient } from '@/bot/telegram-client'
import { sendPostCreateMessages } from '@/bot/commands/natural-expense-helpers'

// ── Helpers ──────────────────────────────────────────────────────────────────
const buildDeps = (
  resolvedAppUserId: string | null = 'app-user-1',
): BotServiceDeps =>
  ({
    db: {} as D1Database,
    config: {
      telegramBotToken: 'test',
      telegramBotTmaUrl: 'https://tma.example.com',
      telegramBotDeepLinkUrl: 'https://t.me/bot',
    },
    resolvedAppUserId,
  }) as BotServiceDeps

const buildClient = () => {
  const answerCallbackQuery = vi.fn().mockResolvedValue(undefined)
  const sendMessage = vi.fn().mockResolvedValue(1)
  const editMessageText = vi.fn().mockResolvedValue({} as Response)

  return {
    answerCallbackQuery,
    sendMessage,
    editMessageText,
  } as unknown as TelegramClient & {
    answerCallbackQuery: ReturnType<typeof vi.fn>
    sendMessage: ReturnType<typeof vi.fn>
    editMessageText: ReturnType<typeof vi.fn>
  }
}

// ── Suite: ch_delete expired ─────────────────────────────────────────────────
describe('post-create pure text: ch_delete expired (no delete keyboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindAppUserIdByTelegramId.mockResolvedValue('app-user-1')
  })

  it('treats ch_delete as expired callback (no handler, fallback message)', async () => {
    const client = buildClient()
    const deps = buildDeps()

    const cq = {
      id: 'cq-1',
      data: 'ch_delete:exp-1',
      from: { id: 200, is_bot: false, first_name: 'Tùng' },
      message: { chat: { id: 100 }, message_id: 42 },
    } as unknown as NonNullable<
      import('@/bot/types').TelegramUpdate['callback_query']
    >

    const result = await handleCallbackQuery(cq, deps, client)

    expect(result).toBe(0)
    expect(client.answerCallbackQuery).toHaveBeenCalledWith(
      'cq-1',
      'Nút đã hết hạn, vui lòng gửi lại',
    )
  })

  it('also expires ch_household and household callbacks', async () => {
    const client = buildClient()
    const deps = buildDeps()

    for (const data of [
      'ch_household:exp-1',
      'household:exp-1:hh-1',
      'confirm:abc',
    ]) {
      vi.clearAllMocks()
      const cq = {
        id: 'cq-x',
        data,
        from: { id: 200, is_bot: false, first_name: 'Tùng' },
        message: { chat: { id: 100 }, message_id: 42 },
      } as unknown as NonNullable<
        import('@/bot/types').TelegramUpdate['callback_query']
      >

      const result = await handleCallbackQuery(cq, deps, client)
      expect(result).toBe(0)
      expect(client.answerCallbackQuery).toHaveBeenCalledWith(
        'cq-x',
        'Nút đã hết hạn, vui lòng gửi lại',
      )
    }
  })

  it('keeps pref/settings dispatch alive (not expired)', async () => {
    const client = buildClient()
    const deps = buildDeps()

    // pref should not be treated as expired - it should dispatch to handler
    // We mock the handler to return a simple response; verify it does not return 0 via fallback
    mockHandlePreferenceToggle.mockResolvedValueOnce({
      text: 'ok',
      parseMode: 'HTML' as const,
    })

    const cq = {
      id: 'cq-pref',
      data: 'pref:budgetAlerts',
      from: { id: 200, is_bot: false, first_name: 'Tùng' },
      message: { chat: { id: 100 }, message_id: 42 },
    } as unknown as NonNullable<
      import('@/bot/types').TelegramUpdate['callback_query']
    >

    const result = await handleCallbackQuery(cq, deps, client)
    expect(result).toBe(1)
    // fallback not called for pref; instead answerCallbackQuery with no message
    expect(client.answerCallbackQuery).toHaveBeenCalledWith('cq-pref')
  })
})

// ── Suite: sendPostCreateMessages pure text ──────────────────────────────────
describe('sendPostCreateMessages pure text (no inline_keyboard)', () => {
  it('edits loader with pure text, parseMode HTML, no replyMarkup', async () => {
    const client = buildClient()

    await sendPostCreateMessages(client, 100, 500, [
      { expenseId: 'exp-1', summary: '🍚 Ăn · ăn bún · 30.000₫ · 25/06' },
      { expenseId: 'exp-2', summary: '☕ Ăn · cà phê · 25.000₫ · 25/06' },
    ])

    expect(client.editMessageText).toHaveBeenCalledTimes(1)
    const call = vi.mocked(client.editMessageText).mock.calls[0]!
    expect(call[0]).toBe(100)
    expect(call[1]).toBe(500)
    expect(call[2]).toMatch(/^✅ Đã thêm 2 khoản/)
    const opts = call[3] as { parseMode?: string; replyMarkup?: unknown }
    expect(opts.parseMode).toBe('HTML')
    expect(opts.replyMarkup).toBeUndefined()
    const serialized = JSON.stringify(call[2] + JSON.stringify(opts))
    expect(serialized).not.toContain('ch_delete')
    expect(serialized).not.toContain('inline_keyboard')
  })

  it('caps 4096 chars and keeps pure text invariants (60-char title is done upstream)', async () => {
    const client = buildClient()
    const longSummary = 'a'.repeat(5000)
    await sendPostCreateMessages(client, 100, 500, [
      { expenseId: 'exp-1', summary: longSummary },
    ])

    const text = vi.mocked(client.editMessageText).mock.calls[0]![2] as string
    expect(text.length).toBeLessThanOrEqual(4096)
    expect(text.endsWith('…')).toBe(true)
    const opts = vi.mocked(client.editMessageText).mock.calls[0]![3] as {
      replyMarkup?: unknown
    }
    expect(opts.replyMarkup).toBeUndefined()
  })
})
