import { describe, expect, it } from 'vitest'

import { handleStartCommand } from '@/bot/commands/start'
import type { CommandContext } from '@/bot/types'

const buildCtx = (overrides: Partial<CommandContext> = {}): CommandContext => ({
  userId: 123_456_789,
  chatId: 987_654_321,
  userDisplayName: null,
  text: '/start',
  appUserId: null,
  locale: 'vi',
  db: {
    prepare: () => ({
      bind: () => ({
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => ({ meta: { changes: 0 } }),
      }),
    }),
  } as unknown as D1Database,
  ...overrides,
})

describe('handleStartCommand', () => {
  it('returns Open App guidance for unlinked user', async () => {
    const ctx = buildCtx()
    const result = await handleStartCommand(ctx)

    expect(result.text).toContain('Mở Mini App')
    expect(result.text).toContain('Xin chào')
    expect(result.parseMode).toBe('HTML')
    expect(result.replyMarkup).toBeDefined()

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const buttons = result.replyMarkup.inline_keyboard.flat()
      const labels = buttons.map((b) => b.text)

      expect(labels).toContain('🏠 Mở Mini App')
      expect(labels).not.toContain('➕ Thêm chi tiêu')
    }
  })

  it('returns main menu for linked user', async () => {
    const ctx = buildCtx({
      appUserId: 'user-abc-123',
      userDisplayName: 'Tung',
    })

    const result = await handleStartCommand(ctx)

    expect(result.text).toContain('Chào Tung')
    expect(result.parseMode).toBe('HTML')

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const buttons = result.replyMarkup.inline_keyboard.flat()
      const labels = buttons.map((b) => b.text)

      expect(labels).toContain('➕ Thêm chi tiêu')
      expect(labels).toContain('📊 Xem thống kê')
      expect(labels).toContain('💸 Ngân sách')
      expect(labels).toContain('👥 Gia đình')
      expect(labels).toContain('⚙️ Cài đặt')
      expect(labels).toContain('🏠 Mở Mini App')
    }
  })

  it('uses fallback greeting for linked user without display name', async () => {
    const ctx = buildCtx({
      appUserId: 'user-xyz',
      userDisplayName: null,
    })

    const result = await handleStartCommand(ctx)

    expect(result.text).toContain('Chào bạn')
  })
})
