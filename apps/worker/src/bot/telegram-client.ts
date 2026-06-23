import type {
  InlineKeyboardMarkup,
  ParseMode,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from './types'

const TELEGRAM_API_BASE = 'https://api.telegram.org'

export class TelegramClient {
  private readonly botToken: string
  private readonly fetchFn: typeof globalThis.fetch

  constructor(
    botToken: string,
    fetchFn: typeof globalThis.fetch = globalThis.fetch,
  ) {
    this.botToken = botToken
    this.fetchFn = fetchFn
  }

  private get apiBase(): string {
    return `${TELEGRAM_API_BASE}/bot${this.botToken}`
  }

  async sendMessage(
    chatId: number | string,
    text: string,
    options?: {
      parseMode?: ParseMode
      replyMarkup?:
        | InlineKeyboardMarkup
        | ReplyKeyboardMarkup
        | ReplyKeyboardRemove
    },
  ): Promise<Response> {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
    }

    if (options?.parseMode) {
      body.parse_mode = options.parseMode
    }

    if (options?.replyMarkup) {
      body.reply_markup = options.replyMarkup
    }

    return this.fetchFn(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
  ): Promise<Response> {
    const body: Record<string, unknown> = {
      callback_query_id: callbackQueryId,
    }

    if (text) {
      body.text = text
    }

    return this.fetchFn(`${this.apiBase}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async setWebhook(url: string, secretToken?: string): Promise<Response> {
    const body: Record<string, unknown> = { url }

    if (secretToken) {
      body.secret_token = secretToken
    }

    return this.fetchFn(`${this.apiBase}/setWebhook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }
}
