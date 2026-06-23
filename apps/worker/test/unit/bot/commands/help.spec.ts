import { describe, expect, it } from 'vitest'

import { handleHelpCommand } from '@/bot/commands/help'
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
  text: '/help',
  appUserId: null,
  locale: 'vi',
  db: mockDb,
  ...overrides,
})

describe('handleHelpCommand', () => {
  it('returns help text with supported commands', () => {
    const ctx = buildCtx()
    const result = handleHelpCommand(ctx)

    expect(result.text).toContain('Trợ lý Chi tiêu')
    expect(result.text).toContain('/start')
    expect(result.text).toContain('/help')
    expect(result.text).toContain('Mở Mini App')
    expect(result.parseMode).toBe('HTML')

    if (result.replyMarkup && 'inline_keyboard' in result.replyMarkup) {
      const buttons = result.replyMarkup.inline_keyboard.flat()
      const labels = buttons.map((b) => b.text)

      expect(labels).toContain('🏠 Mở Mini App')
    }
  })

  it('works for both linked and unlinked users', () => {
    const linkedResult = handleHelpCommand(buildCtx({ appUserId: 'user-1' }))
    const unlinkedResult = handleHelpCommand(buildCtx({ appUserId: null }))

    expect(linkedResult.text).toBe(unlinkedResult.text)
  })
})
