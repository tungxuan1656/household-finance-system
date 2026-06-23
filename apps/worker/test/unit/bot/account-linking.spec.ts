import { describe, expect, it } from 'vitest'

import { findAppUserIdByTelegramId } from '@/bot/account-linking'

describe('account-linking', () => {
  it('returns null when no identity exists', async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: async () => null,
        }),
      }),
    } as unknown as D1Database

    const result = await findAppUserIdByTelegramId(mockDb, '999999')

    expect(result).toBeNull()
  })

  it('returns userId when identity exists', async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: async () => ({ user_id: 'user-linked-123' }),
        }),
      }),
    } as unknown as D1Database

    const result = await findAppUserIdByTelegramId(mockDb, '555000111')

    expect(result).toBe('user-linked-123')
  })
})
