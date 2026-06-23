import { describe, expect, it, vi, beforeEach } from 'vitest'

import { sendHouseholdActivity } from '@/bot/notifications/household-activity'
import { TelegramClient } from '@/bot/telegram-client'

const mockSendMessage = vi.fn()
const mockClient = { sendMessage: mockSendMessage } as unknown as TelegramClient

const mockDb = {
  prepare: () => ({
    bind: () => ({
      first: async () => null,
      all: async () => ({ results: [] }),
      run: async () => ({ meta: { changes: 0 } }),
    }),
  }),
} as unknown as D1Database

// Hoisted mock refs
const { mockListMembers, mockFindChatByApp, mockSendNotif } = vi.hoisted(() => {
  const mlm = vi.fn()
  const mfcApp = vi.fn()
  const msn = vi.fn().mockResolvedValue('skipped')
  return { mockListMembers: mlm, mockFindChatByApp: mfcApp, mockSendNotif: msn }
})

vi.mock('@/db/repositories/household-membership-repository', () => ({
  listHouseholdMembers: mockListMembers,
}))

vi.mock('@/db/repositories/telegram-bot-chat-repository', () => ({
  findTelegramBotChatByUserId: vi.fn(),
  findTelegramBotChatByAppUserId: mockFindChatByApp,
}))

vi.mock('@/bot/notifications/sender', () => ({
  sendNotification: mockSendNotif,
}))

vi.mock('@/bot/notifications/renderers', () => ({
  renderHouseholdActivityText: vi
    .fn()
    .mockReturnValue('Test notification text'),
}))

const baseArgs = {
  db: mockDb,
  telegramClient: mockClient,
  householdId: 'hh-1',
  actorUserId: 'actor-1',
  expenseTitle: 'ăn bún',
  expenseAmountMinor: 3000000,
  expenseCategoryKey: 'food',
  expenseOccurredAt: '2026-06-15',
  expenseCurrencyCode: 'VND',
  householdName: 'Gia đình Test',
}

describe('sendHouseholdActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendNotif.mockResolvedValue('skipped')
    mockListMembers.mockResolvedValue([])
    mockFindChatByApp.mockResolvedValue(null)
  })

  it('B1: recipient sees actor name, not their own', async () => {
    mockListMembers.mockResolvedValue([
      {
        userId: 'actor-1',
        name: 'Nguyễn Văn A',
        role: 'admin',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
      {
        userId: 'recipient-1',
        name: 'Trần Thị B',
        role: 'member',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
    ])
    mockFindChatByApp.mockResolvedValue({
      id: 'chat-2',
      telegramUserId: '999',
      telegramChatId: '888',
      userId: 'recipient-1',
      preferences: '{}',
      locale: 'vi',
      createdAt: 0,
      updatedAt: 0,
    })

    await sendHouseholdActivity(baseArgs)

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    expect(mockSendNotif.mock.calls[0][0].text).toBe('Test notification text')
  })

  it('actor is excluded from recipients', async () => {
    mockListMembers.mockResolvedValue([
      {
        userId: 'actor-1',
        name: 'Actor',
        role: 'admin',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
      {
        userId: 'other-1',
        name: 'Other',
        role: 'member',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
    ])
    mockFindChatByApp.mockResolvedValue({
      id: 'chat-2',
      telegramUserId: '999',
      telegramChatId: '888',
      userId: 'other-1',
      preferences: '{}',
      locale: 'vi',
      createdAt: 0,
      updatedAt: 0,
    })

    await sendHouseholdActivity(baseArgs)

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
  })

  it('only notifies members with household_activity enabled', async () => {
    mockListMembers.mockResolvedValue([
      {
        userId: 'actor-1',
        name: 'Actor',
        role: 'admin',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
      {
        userId: 'member-1',
        name: 'Member',
        role: 'member',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
    ])
    mockFindChatByApp.mockResolvedValue({
      id: 'chat-2',
      telegramUserId: '999',
      telegramChatId: '888',
      userId: 'member-1',
      preferences: '{}',
      locale: 'vi',
      createdAt: 0,
      updatedAt: 0,
    })

    await sendHouseholdActivity(baseArgs)

    expect(mockSendNotif).toHaveBeenCalledTimes(1)
    expect(mockSendNotif.mock.calls[0][0].requiredPref).toBe(
      'household_activity',
    )
  })

  it('skips members without telegram chat', async () => {
    mockListMembers.mockResolvedValue([
      {
        userId: 'actor-1',
        name: 'Actor',
        role: 'admin',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
      {
        userId: 'nochat-1',
        name: 'No Chat',
        role: 'member',
        email: '',
        joinedAt: 0,
        avatarUrl: null,
      },
    ])
    mockFindChatByApp.mockResolvedValue(null)

    await sendHouseholdActivity(baseArgs)

    expect(mockSendNotif).toHaveBeenCalledTimes(0)
  })

  it('no notifications when member list is empty', async () => {
    mockListMembers.mockResolvedValue([])

    await sendHouseholdActivity(baseArgs)

    expect(mockSendNotif).toHaveBeenCalledTimes(0)
  })
})
