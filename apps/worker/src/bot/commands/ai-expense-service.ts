import { LOADER_TEXT } from '@/bot/format'

import type { BotServiceDeps } from '../callback-dispatcher'
import { buildCtx } from '../callback-dispatcher'
import {
  handleAddExpenseCommand,
  type MultiExpenseResult,
} from '../commands/ai-expense'
import type { TelegramClient } from '../telegram-client'
import type { InlineKeyboardMarkup, TelegramUpdate } from '../types'

/**
 * Handle the `/add` command: send loader, run handler, then either edit
 * the loader (single/error) or edit the loader to the first preview and
 * send one Telegram message per remaining preview (batch).
 * Supports one valid item (single preview) or multiple valid items
 * (one preview message per item).
 * Returns 1 if the message was processed.
 */
export const runAddExpenseCommand = async (
  update: TelegramUpdate,
  deps: BotServiceDeps,
  client: TelegramClient,
  chatId: number,
  appUserId: string | null,
): Promise<number> => {
  const message = update.message

  if (!message?.text || !message.from) {
    return 0
  }

  const ctx = buildCtx({
    userId: message.from.id,
    chatId,
    text: message.text,
    appUserId,
    deps,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    languageCode: message.from.language_code,
  })

  const loaderMsgId = await client.sendMessage(ctx.chatId, LOADER_TEXT)

  const result: MultiExpenseResult = await handleAddExpenseCommand(ctx)

  if (result.kind === 'single') {
    await client.editMessageText(
      ctx.chatId,
      loaderMsgId,
      result.response.text,
      {
        parseMode: result.response.parseMode,
        replyMarkup: result.response.replyMarkup as
          | InlineKeyboardMarkup
          | undefined,
      },
    )

    return 1
  }

  // Batch: send previews (if any), then send dedupe confirmation messages
  // (if any). Each preview gets its own messageId + draftId so the
  // per-message edit-in-place machinery works unchanged. Each dedupe hit
  // is a standalone confirmation message, no loader edit or special
  // handling needed.

  if (result.previews.length > 0) {
    const first = result.previews[0]!
    const firstText = result.truncatedNote
      ? first.text + result.truncatedNote
      : first.text

    await client.editMessageText(ctx.chatId, loaderMsgId, firstText, {
      parseMode: 'HTML',
      replyMarkup: first.replyMarkup,
    })

    for (let i = 1; i < result.previews.length; i++) {
      const p = result.previews[i]!

      await client.sendMessage(ctx.chatId, p.text, {
        parseMode: 'HTML',
        replyMarkup: p.replyMarkup,
      })
    }
  }

  // Send dedupe hits as standalone confirmation messages.
  for (const hit of result.dedupeHits) {
    await client.sendMessage(ctx.chatId, hit.text, {
      parseMode: 'HTML',
    })
  }

  return 1
}
