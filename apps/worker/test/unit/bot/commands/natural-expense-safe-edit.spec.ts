import { describe, expect, it, vi } from 'vitest'

import { createSafeEdit } from '@/bot/commands/natural-expense-safe-edit'
import type { TelegramClient } from '@/bot/telegram-client'

describe('createSafeEdit retriable logic', () => {
  it('retries once on 429 then succeeds', async () => {
    vi.useFakeTimers()
    const edit = vi
      .fn()
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockResolvedValueOnce({} as Response)
    const send = vi.fn().mockResolvedValue(1)
    const client = {
      editMessageText: edit,
      sendMessage: send,
    } as unknown as TelegramClient
    const p = createSafeEdit(client, 'cid-429')(100, 500, 'hello 429')
    await vi.advanceTimersByTimeAsync(500)
    await p
    expect(edit).toHaveBeenCalledTimes(2)
    expect(send).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('fallback immediately on 400 Bad Request without retry', async () => {
    const edit = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('400 Bad Request: message is not modified'),
      )
    const send = vi.fn().mockResolvedValue(1)
    const client = {
      editMessageText: edit,
      sendMessage: send,
    } as unknown as TelegramClient
    await createSafeEdit(client, 'cid-400')(100, 500, 'hello 400')
    expect(edit).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith(100, 'hello 400', {
      parseMode: 'HTML',
    })
  })

  it('fallback to sendMessage after two retriable failures', async () => {
    vi.useFakeTimers()
    const edit = vi
      .fn()
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
    const send = vi.fn().mockResolvedValue(1)
    const client = {
      editMessageText: edit,
      sendMessage: send,
    } as unknown as TelegramClient
    const p = createSafeEdit(client, 'cid-503')(100, 500, 'hello 503')
    await vi.advanceTimersByTimeAsync(500)
    await p
    expect(edit).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('logs fallback_send_failed when sendMessage also fails', async () => {
    vi.useFakeTimers()
    const edit = vi
      .fn()
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
    const send = vi.fn().mockRejectedValueOnce(new Error('send failed'))
    const client = {
      editMessageText: edit,
      sendMessage: send,
    } as unknown as TelegramClient
    const p = createSafeEdit(client, 'cid-fail')(100, 500, 'hello fail')
    await vi.advanceTimersByTimeAsync(500)
    await expect(p).resolves.toBeUndefined()
    expect(edit).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
