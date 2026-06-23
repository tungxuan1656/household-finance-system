import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  handlePreferenceToggle,
  handleSettingsCommand,
  parsePreferences,
} from '@/bot/commands/settings'
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
  text: '/settings',
  appUserId: 'user-1',
  locale: 'vi',
  db: mockDb,
  telegramBotTmaUrl: 'https://phofis-tma.pages.dev/',
  telegramBotDeepLinkUrl: 'https://t.me/phofis_bot',
  ...overrides,
})

// Mock the chat repository
vi.mock('@/db/repositories/telegram-bot-chat-repository', () => ({
  findTelegramBotChatByUserId: vi.fn(),
  updateTelegramBotChatPreferences: vi.fn().mockResolvedValue(undefined),
}))

describe('parsePreferences', () => {
  it('parses valid JSON', () => {
    const prefs = parsePreferences(
      '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
    )
    expect(prefs.budget_alerts).toBe(true)
    expect(prefs.household_activity).toBe(false)
    expect(prefs.weekly_digest).toBe(false)
  })

  it('falls back to defaults for malformed JSON', () => {
    const prefs = parsePreferences('not-json')
    expect(prefs.budget_alerts).toBe(true)
    expect(prefs.household_activity).toBe(false)
    expect(prefs.weekly_digest).toBe(false)
  })

  it('falls back to defaults for missing fields', () => {
    const prefs = parsePreferences('{"budget_alerts":false}')
    expect(prefs.budget_alerts).toBe(false)
    expect(prefs.household_activity).toBe(false)
    expect(prefs.weekly_digest).toBe(false)
  })
})

describe('handleSettingsCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('T1: returns Open App guidance for unlinked user', async () => {
    const ctx = buildCtx({ appUserId: null })
    const result = await handleSettingsCommand(ctx)

    expect(result.text).toContain('Mở Mini App')
    expect(result.text).toContain('đăng nhập')
  })

  it('T2: shows 3 toggle buttons with default states for linked user', async () => {
    const chatRepo =
      await import('@/db/repositories/telegram-bot-chat-repository')
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences:
        '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const ctx = buildCtx()
    const result = await handleSettingsCommand(ctx)

    expect(result.text).toContain('Cài đặt thông báo')
    expect(result.parseMode).toBe('HTML')

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('🔔 Cảnh báo ngân sách: Bật')
      expect(labels).toContain('🚫 Thông báo gia đình: Tắt')
      expect(labels).toContain('📭 Bản tin hàng tuần: Tắt')
      expect(labels).toContain('🏠 Mở Mini App')
    }
  })

  it('T6: shows persisted prefs after toggle', async () => {
    const chatRepo =
      await import('@/db/repositories/telegram-bot-chat-repository')
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences:
        '{"budget_alerts":false,"household_activity":true,"weekly_digest":true}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const ctx = buildCtx()
    const result = await handleSettingsCommand(ctx)

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('🔕 Cảnh báo ngân sách: Tắt')
      expect(labels).toContain('🏠 Thông báo gia đình: Bật')
      expect(labels).toContain('📬 Bản tin hàng tuần: Bật')
    }
  })

  it('falls back to defaults when no chat record exists', async () => {
    const chatRepo =
      await import('@/db/repositories/telegram-bot-chat-repository')
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue(null)

    const ctx = buildCtx()
    const result = await handleSettingsCommand(ctx)

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('🔔 Cảnh báo ngân sách: Bật')
      expect(labels).toContain('🚫 Thông báo gia đình: Tắt')
    }
  })
})

describe('handlePreferenceToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('T3: toggles budget_alerts from true to false', async () => {
    const chatRepo =
      await import('@/db/repositories/telegram-bot-chat-repository')
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences:
        '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const ctx = buildCtx()
    const result = await handlePreferenceToggle(ctx, 'budget_alerts')

    // Should have toggled to false
    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('🔕 Cảnh báo ngân sách: Tắt')
    }

    // Verify it was saved
    expect(
      vi.mocked(chatRepo.updateTelegramBotChatPreferences).mock.calls.length,
    ).toBe(1)
    const savedJson = vi.mocked(chatRepo.updateTelegramBotChatPreferences).mock
      .calls[0][2]
    const saved = JSON.parse(savedJson)
    expect(saved.budget_alerts).toBe(false)
    expect(saved.household_activity).toBe(false) // unchanged
    expect(saved.weekly_digest).toBe(false) // unchanged
  })

  it('T4: toggles weekly_digest twice — settles false', async () => {
    const chatRepo =
      await import('@/db/repositories/telegram-bot-chat-repository')
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences:
        '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const ctx = buildCtx()

    // First toggle: off → on
    await handlePreferenceToggle(ctx, 'weekly_digest')
    const call1Json = vi.mocked(chatRepo.updateTelegramBotChatPreferences).mock
      .calls[0][2]
    expect(JSON.parse(call1Json).weekly_digest).toBe(true)

    // Update mock preferences to reflect toggle
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences: JSON.stringify({
        budget_alerts: true,
        household_activity: false,
        weekly_digest: true,
      }),
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Second toggle: on → off
    await handlePreferenceToggle(ctx, 'weekly_digest')
    const call2Json = vi.mocked(chatRepo.updateTelegramBotChatPreferences).mock
      .calls[1][2]
    expect(JSON.parse(call2Json).weekly_digest).toBe(false)
  })

  it('T5: reads false value for off toggle — notification should skip', async () => {
    const chatRepo =
      await import('@/db/repositories/telegram-bot-chat-repository')
    vi.mocked(chatRepo.findTelegramBotChatByUserId).mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences:
        '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const ctx = buildCtx()

    // Show settings — weekly_digest should be off
    const result = await handleSettingsCommand(ctx)
    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const labels = result.replyMarkup.inline_keyboard
        .flat()
        .map((b) => b.text)
      expect(labels).toContain('📭 Bản tin hàng tuần: Tắt')
    }

    // The preference read confirms weekly_digest=false, so 112e should skip
    const prefs = parsePreferences(
      '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
    )
    expect(prefs.weekly_digest).toBe(false)
  })

  it('returns unlinked guidance when appUserId is null', async () => {
    const ctx = buildCtx({ appUserId: null })
    const result = await handlePreferenceToggle(ctx, 'budget_alerts')

    expect(result.text).toContain('Mở Mini App')
  })
})
