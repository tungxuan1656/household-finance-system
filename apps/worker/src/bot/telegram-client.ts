import type {
  InlineKeyboardMarkup,
  ParseMode,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from './types'

const TELEGRAM_API_BASE = 'https://api.telegram.org'
const TELEGRAM_API_TIMEOUT_MS = 10_000

export class TelegramClient {
  private readonly botToken: string
  private readonly fetchFn: typeof globalThis.fetch

  constructor(
    botToken: string,
    fetchFn: typeof globalThis.fetch = globalThis.fetch,
  ) {
    this.botToken = botToken
    this.fetchFn = (input, init) => fetchFn.call(globalThis, input, init)
  }

  private get apiBase(): string {
    return `${TELEGRAM_API_BASE}/bot${this.botToken}`
  }

  /**
   * Throw on non-2xx Telegram API response.
   */
  private async throwOnError(response: Response): Promise<void> {
    if (response.ok) {
      // Telegram returns 200 with { ok: true } on success
      let body: { ok?: boolean; description?: string } | undefined

      try {
        body = (await response.json()) as { ok?: boolean; description?: string }
      } catch {
        // Non-JSON body from a 200 response is unexpected — assume success
        return
      }

      if (body && body.ok === false) {
        throw new Error(`Telegram API error: ${body.description ?? 'unknown'}`)
      }

      return
    }

    // HTTP error (4xx/5xx) — try to extract description from JSON body
    let description: string | undefined

    try {
      const body = (await response.json()) as {
        ok?: boolean
        description?: string
      }

      description = body?.description
    } catch {
      // Non-JSON body — use status text only
    }

    const detail = description ?? (response.statusText || 'Unknown HTTP error')

    throw new Error(`Telegram API HTTP ${response.status}: ${detail}`)
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
  ): Promise<number> {
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

    const response = await this.fetchFn(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TELEGRAM_API_TIMEOUT_MS),
    })

    const result = (await response.json()) as {
      ok?: boolean
      result?: { message_id: number }
      description?: string
    }

    if (!response.ok) {
      throw new Error(
        `Telegram API HTTP ${response.status}: ${result?.description || response.statusText}`,
      )
    }

    if (result && result.ok === false) {
      throw new Error(`Telegram API error: ${result.description ?? 'unknown'}`)
    }

    return result!.result!.message_id
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

    const response = await this.fetchFn(`${this.apiBase}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TELEGRAM_API_TIMEOUT_MS),
    })

    await this.throwOnError(response)

    return response
  }

  async editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    options?: {
      parseMode?: ParseMode
      replyMarkup?: InlineKeyboardMarkup
    },
  ): Promise<Response> {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
    }

    if (options?.parseMode) {
      body.parse_mode = options.parseMode
    }

    if (options?.replyMarkup) {
      body.reply_markup = options.replyMarkup
    }

    const response = await this.fetchFn(`${this.apiBase}/editMessageText`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TELEGRAM_API_TIMEOUT_MS),
    })

    await this.throwOnError(response)

    return response
  }

  async editMessageReplyMarkup(
    chatId: number | string,
    messageId: number,
    replyMarkup?: InlineKeyboardMarkup,
  ): Promise<Response> {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
    }

    if (replyMarkup) {
      body.reply_markup = replyMarkup
    }

    const response = await this.fetchFn(
      `${this.apiBase}/editMessageReplyMarkup`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TELEGRAM_API_TIMEOUT_MS),
      },
    )

    await this.throwOnError(response)

    return response
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
