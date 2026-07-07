import { SELF, env } from 'cloudflare:test'
import { describe, expect, it, beforeEach } from 'vitest'

import { applyMigrations } from '../helpers/apply-migrations'
import { type ApiEnvelope, parseJson } from '../helpers/test-context'
import { buildTelegramInitData } from '../fixtures/telegram-init-data'

const botWebhookPath = '/api/v1/telegram/webhook'

const validUpdateBody = {
  update_id: 100500,
  message: {
    message_id: 1,
    from: {
      id: 123_456_789,
      is_bot: false,
      first_name: 'Test',
      language_code: 'vi',
    },
    chat: {
      id: 987_654_321,
      type: 'private',
    },
    date: Math.floor(Date.now() / 1000),
    text: '/start',
  },
}

describe('Worker integration: Telegram bot webhook', () => {
  beforeEach(async () => {
    await applyMigrations(env.DB)
  })

  it('rejects webhook with invalid secret - returns 401', async () => {
    const response = await SELF.fetch(`https://example.com${botWebhookPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'wrong-secret',
      },
      body: JSON.stringify(validUpdateBody),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects webhook with missing secret header - returns 401', async () => {
    const response = await SELF.fetch(`https://example.com${botWebhookPath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validUpdateBody),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects webhook with empty secret header - returns 401', async () => {
    const response = await SELF.fetch(`https://example.com${botWebhookPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': '',
      },
      body: JSON.stringify(validUpdateBody),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 200 with valid secret (Telegram expects 200)', async () => {
    const response = await SELF.fetch(`https://example.com${botWebhookPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'test-webhook-secret',
      },
      body: JSON.stringify(validUpdateBody),
    })

    // Telegram expects a 200 response; outgoing API call may fail in test
    // but the route should still return 200 with { ok: true }
    const payload = await parseJson<ApiEnvelope<{ ok: boolean }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.ok).toBe(true)
  })

  it('populates telegram_bot_chats.user_id for linked Telegram user (W1)', async () => {
    const telegramUserId = 777_000_777
    const chatId = 777_000_888

    // First, link the Telegram user via auth provider exchange
    const initData = await buildTelegramInitData({
      user: {
        id: telegramUserId,
        first_name: 'Linked',
        last_name: 'User',
      },
    })

    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: 'telegram', initData }),
      },
    )

    expect(exchangeResponse.status).toBe(200)

    const exchangePayload =
      await parseJson<ApiEnvelope<{ user: { id: string } }>>(exchangeResponse)

    const appUserId = exchangePayload.data.user.id

    // Send /start webhook from the same Telegram user
    const webhookResponse = await SELF.fetch(
      `https://example.com${botWebhookPath}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-telegram-bot-api-secret-token': 'test-webhook-secret',
        },
        body: JSON.stringify({
          update_id: 999_001,
          message: {
            message_id: 10,
            from: {
              id: telegramUserId,
              is_bot: false,
              first_name: 'Linked',
              language_code: 'vi',
            },
            chat: { id: chatId, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            text: '/start',
          },
        }),
      },
    )

    expect(webhookResponse.status).toBe(200)

    // Verify the chat record was upserted with the correct user_id
    const chatRow = await env.DB.prepare(
      `SELECT id, telegram_user_id, telegram_chat_id, user_id
           FROM telegram_bot_chats
          WHERE telegram_user_id = ?`,
    )
      .bind(String(telegramUserId))
      .first<{
        id: string
        telegram_user_id: string
        telegram_chat_id: string
        user_id: string | null
      }>()

    expect(chatRow).not.toBeNull()
    expect(chatRow!.user_id).toBe(appUserId)
    expect(chatRow!.telegram_user_id).toBe(String(telegramUserId))
    expect(chatRow!.telegram_chat_id).toBe(String(chatId))
  })

  it('leaves telegram_bot_chats.user_id null for unlinked user', async () => {
    const telegramUserId = 888_000_999

    const webhookResponse = await SELF.fetch(
      `https://example.com${botWebhookPath}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-telegram-bot-api-secret-token': 'test-webhook-secret',
        },
        body: JSON.stringify({
          update_id: 999_002,
          message: {
            message_id: 11,
            from: {
              id: telegramUserId,
              is_bot: false,
              first_name: 'Unlinked',
              language_code: 'vi',
            },
            chat: { id: 999_888_777, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            text: '/help',
          },
        }),
      },
    )

    expect(webhookResponse.status).toBe(200)

    const chatRow = await env.DB.prepare(
      `SELECT user_id
           FROM telegram_bot_chats
          WHERE telegram_user_id = ?`,
    )
      .bind(String(telegramUserId))
      .first<{ user_id: string | null }>()

    expect(chatRow).not.toBeNull()
    expect(chatRow!.user_id).toBeNull()
  })

  it('handles /settings slash command for linked user', async () => {
    const telegramUserId = 555_666_777

    // Link the user first
    const { buildTelegramInitData } =
      await import('../fixtures/telegram-init-data')
    const initData = await buildTelegramInitData({
      user: { id: telegramUserId, first_name: 'Settings', last_name: 'Test' },
    })

    await SELF.fetch('https://example.com/api/v1/auth/provider/exchange', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'telegram', initData }),
    })

    const response = await SELF.fetch(`https://example.com${botWebhookPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'test-webhook-secret',
      },
      body: JSON.stringify({
        update_id: 999_003,
        message: {
          message_id: 20,
          from: {
            id: telegramUserId,
            is_bot: false,
            first_name: 'Settings',
            language_code: 'vi',
          },
          chat: { id: 555_666_888, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: '/settings',
        },
      }),
    })

    expect(response.status).toBe(200)
  })

  it('backfills telegram_bot_chats.user_id when auth follows webhook (bot-opened-first scenario)', async () => {
    const telegramUserId = 666_111_333
    const chatId = 666_111_444

    // Step 1: Bot webhook first — chat row created with null user_id
    const webhookResponse = await SELF.fetch(
      `https://example.com${botWebhookPath}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-telegram-bot-api-secret-token': 'test-webhook-secret',
        },
        body: JSON.stringify({
          update_id: 999_100,
          message: {
            message_id: 50,
            from: {
              id: telegramUserId,
              is_bot: false,
              first_name: 'BotFirst',
              language_code: 'vi',
            },
            chat: { id: chatId, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            text: '/start',
          },
        }),
      },
    )

    expect(webhookResponse.status).toBe(200)

    // Verify row exists with null user_id
    const beforeRow = await env.DB.prepare(
      `SELECT user_id
         FROM telegram_bot_chats
        WHERE telegram_user_id = ?`,
    )
      .bind(String(telegramUserId))
      .first<{ user_id: string | null }>()

    expect(beforeRow).not.toBeNull()
    expect(beforeRow!.user_id).toBeNull()

    // Step 2: Telegram auth exchange
    const initData = await buildTelegramInitData({
      user: {
        id: telegramUserId,
        first_name: 'BotFirst',
      },
    })

    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: 'telegram', initData }),
      },
    )

    expect(exchangeResponse.status).toBe(200)

    const exchangePayload =
      await parseJson<ApiEnvelope<{ user: { id: string } }>>(exchangeResponse)

    const appUserId = exchangePayload.data.user.id

    // Step 3: Verify chat row now has user_id backfilled
    const afterRow = await env.DB.prepare(
      `SELECT user_id
         FROM telegram_bot_chats
        WHERE telegram_user_id = ?`,
    )
      .bind(String(telegramUserId))
      .first<{ user_id: string | null }>()

    expect(afterRow).not.toBeNull()
    expect(afterRow!.user_id).toBe(appUserId)
  })

  it('ignores updates from bot users', async () => {
    const botUpdate = {
      update_id: 100501,
      message: {
        message_id: 2,
        from: {
          id: 999_999,
          is_bot: true,
          first_name: 'SomeBot',
        },
        chat: {
          id: 888_888,
          type: 'private',
        },
        date: Math.floor(Date.now() / 1000),
        text: '/start',
      },
    }

    const response = await SELF.fetch(`https://example.com${botWebhookPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'test-webhook-secret',
      },
      body: JSON.stringify(botUpdate),
    })

    const payload = await parseJson<ApiEnvelope<{ ok: boolean }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.ok).toBe(true)
  })
})
