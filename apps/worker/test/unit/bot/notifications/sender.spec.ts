import { describe, expect, it, vi, beforeEach } from 'vitest'

import { sendNotification } from '@/bot/notifications/sender'
import { TelegramClient } from '@/bot/telegram-client'

const mockSendMessage = vi.fn()
const mockClient = {
  sendMessage: mockSendMessage,
} as unknown as TelegramClient

const mockDb = {
  prepare: () => ({
    bind: () => ({
      first: async () => null,
      all: async () => ({ results: [] }),
      run: async () => ({ meta: { changes: 0 } }),
    }),
  }),
} as unknown as D1Database

// Hoisted mock refs — vi.mock factories are hoisted, so these must be defined before
const { mockFindChat, mockHasDelivery, mockInsertDelivery, mockParsePrefs } =
  vi.hoisted(() => {
    const mfc = vi.fn()
    const mhd = vi.fn().mockResolvedValue(false)
    const mid = vi.fn().mockResolvedValue(true)
    const mpp = vi.fn().mockReturnValue({
      budget_alerts: true,
      household_activity: true,
      weekly_digest: true,
    })
    return {
      mockFindChat: mfc,
      mockHasDelivery: mhd,
      mockInsertDelivery: mid,
      mockParsePrefs: mpp,
    }
  })

vi.mock('@/db/repositories/telegram-bot-chat-repository', () => ({
  findTelegramBotChatByUserId: mockFindChat,
}))

vi.mock(
  '@/db/repositories/telegram-bot-notification-delivery-repository',
  () => ({
    hasDelivery: mockHasDelivery,
    insertDelivery: mockInsertDelivery,
  }),
)

vi.mock('@/bot/commands/settings', () => ({
  parsePreferences: mockParsePrefs,
}))

const baseOpts = {
  db: mockDb,
  telegramClient: mockClient,
  telegramUserId: '123456789',
  notificationType: 'budget_warning' as const,
  dedupeKey: 'test:key:1',
  text: 'Test notification',
  parseMode: 'HTML' as const,
}

describe('sendNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMessage.mockReset()
    // Re-apply default mocks after clearAllMocks
    mockHasDelivery.mockResolvedValue(false)
    mockInsertDelivery.mockResolvedValue(true)
    mockParsePrefs.mockReturnValue({
      budget_alerts: true,
      household_activity: true,
      weekly_digest: true,
    })
  })

  const setupChat = (overrides: Record<string, unknown> = {}) => {
    mockFindChat.mockResolvedValue({
      id: 'chat-1',
      telegramUserId: '123456789',
      telegramChatId: '987654321',
      userId: 'user-1',
      preferences: '{}',
      locale: 'vi',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    })
  }

  it('skips when chat record not found (unlinked)', async () => {
    mockFindChat.mockResolvedValue(null)

    const result = await sendNotification(baseOpts)

    expect(result).toBe('skipped')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('skips when chat record exists but user_id is null', async () => {
    setupChat({ userId: null })

    const result = await sendNotification(baseOpts)

    expect(result).toBe('skipped')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('T2: skips when required preference is off', async () => {
    setupChat()
    mockParsePrefs.mockReturnValue({
      budget_alerts: false,
      household_activity: false,
      weekly_digest: false,
    })

    const result = await sendNotification({
      ...baseOpts,
      requiredPref: 'budget_alerts',
    })

    expect(result).toBe('skipped')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('T1: skips when dedupe key already exists', async () => {
    setupChat()
    mockHasDelivery.mockResolvedValue(true)

    const result = await sendNotification(baseOpts)

    expect(result).toBe('skipped')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('T6: marks failed when Telegram API errors', async () => {
    setupChat()
    mockSendMessage.mockRejectedValue(new Error('Network error'))

    const result = await sendNotification(baseOpts)

    expect(result).toBe('failed')
  })

  it('sends successfully and records delivery', async () => {
    setupChat()
    mockSendMessage.mockResolvedValue(new Response('ok', { status: 200 }))

    const result = await sendNotification(baseOpts)

    expect(result).toBe('sent')
    expect(mockSendMessage).toHaveBeenCalledWith(
      '123456789',
      'Test notification',
      expect.objectContaining({ parseMode: 'HTML' }),
    )
  })

  it('T7: records skipped for preference-off', async () => {
    setupChat()
    mockParsePrefs.mockReturnValue({
      budget_alerts: false,
      household_activity: false,
      weekly_digest: false,
    })

    const result = await sendNotification({
      ...baseOpts,
      requiredPref: 'weekly_digest',
    })

    expect(result).toBe('skipped')
  })
})
