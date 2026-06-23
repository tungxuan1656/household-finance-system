import type { SupportedLocale } from '@/lib/i18n'

/** Raw Telegram Update object — only fields we need for /start and /help. */
export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

export interface TelegramMessage {
  message_id: number
  chat: TelegramChat
  from?: TelegramUser
  text?: string
  date: number
}

export interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  first_name?: string
  last_name?: string
  username?: string
}

export interface TelegramUser {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramMessageEntity {
  type: string
  offset: number
  length: number
}

export type ParseMode = 'HTML' | 'MarkdownV2'

export interface SendMessageParams {
  chatId: number | string
  text: string
  parseMode?: ParseMode
  replyMarkup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

export interface InlineKeyboardButton {
  text: string
  url?: string
  callback_data?: string
  web_app?: { url: string }
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][]
  resize_keyboard?: boolean
  one_time_keyboard?: boolean
  input_field_placeholder?: string
}

export interface ReplyKeyboardRemove {
  remove_keyboard: true
}

export interface KeyboardButton {
  text: string
}

export interface BotResponse {
  text: string
  parseMode?: ParseMode
  replyMarkup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove
}

/** Context passed to command handlers. */
export interface CommandContext {
  userId: number
  chatId: number
  userDisplayName: string | null
  text: string
  appUserId: string | null
  locale: SupportedLocale
  db: D1Database
  /** Bag of worker env vars needed by specific commands (e.g. AI config). */
  env?: Record<string, string | undefined>
  /** Configured TMA URL for web_app.url buttons and text links. */
  telegramBotTmaUrl: string
  /** Configured deep-link URL for bot chat links / future use. */
  telegramBotDeepLinkUrl: string
}
