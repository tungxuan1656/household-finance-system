import { Hono } from 'hono'

import { findAppUserIdByTelegramId } from '@/bot/account-linking'
import { handleUpdate } from '@/bot/service'
import { TelegramClient } from '@/bot/telegram-client'
import type { TelegramUpdate } from '@/bot/types'
import { verifyWebhookSecret } from '@/bot/webhook-security'
import { upsertTelegramBotChat } from '@/db/repositories/telegram-bot-chat-repository'
import { readConfig } from '@/lib/env'
import { success } from '@/lib/response'
import type { AppBindings } from '@/types'

export const telegramBotRoutes = new Hono<AppBindings>()

telegramBotRoutes.post('/telegram/webhook', async (ctx) => {
  const config = readConfig(ctx.env)

  // Always verify webhook secret — required at config level
  const headerSecret = ctx.req.header('X-Telegram-Bot-Api-Secret-Token')
  verifyWebhookSecret(config.telegramBotWebhookSecret, headerSecret)

  const update = await ctx.req.json<TelegramUpdate>()

  // Resolve app user identity once and share with upsert + command handler
  let resolvedAppUserId: string | null = null

  if (update.message?.from && !update.message.from.is_bot) {
    const telegramUserId = String(update.message.from.id)

    resolvedAppUserId = await findAppUserIdByTelegramId(
      ctx.env.DB,
      telegramUserId,
    ).catch((err: unknown) => {
      console.error('telegram-webhook: identity lookup failed', err)

      return null
    })

    await upsertTelegramBotChat(ctx.env.DB, {
      telegramUserId,
      telegramChatId: String(update.message.chat.id),
      userId: resolvedAppUserId,
      locale: update.message.from.language_code ?? 'vi',
    }).catch((err: unknown) => {
      console.error('telegram-webhook: upsert chat record failed', err)
    })
  }

  const client = new TelegramClient(config.telegramBotToken)

  await handleUpdate(update, {
    db: ctx.env.DB,
    config,
    telegramClient: client,
    resolvedAppUserId,
    env: {
      OPENAI_COMPAT_BASE_URL: ctx.env.OPENAI_COMPAT_BASE_URL,
      OPENAI_COMPAT_API_KEY: ctx.env.OPENAI_COMPAT_API_KEY,
      OPENAI_COMPAT_MODEL: ctx.env.OPENAI_COMPAT_MODEL,
    },
  }).catch((err: unknown) => {
    console.error('telegram-webhook: handler error', err)
  })

  return success(ctx, { ok: true })
})
