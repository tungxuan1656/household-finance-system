import { describe, expect, it, vi } from 'vitest'

import { TelegramClient } from '@/bot/telegram-client'

describe('TelegramClient', () => {
  it('calls injected fetch with globalThis binding', async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

    const fetchMock = vi.fn(function (this: unknown) {
      expect(this).toBe(globalThis)

      return Promise.resolve(response)
    }) as typeof globalThis.fetch

    const client = new TelegramClient('test-token', fetchMock)

    await client.sendMessage(123, 'hello')

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api.telegram.org/bottest-token/sendMessage',
    )
  })
})
