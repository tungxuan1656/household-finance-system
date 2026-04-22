import type { SupportedLocale } from './locales'
import { type MessageKey, viMessages } from './messages.vi'

export const messageCatalog = {
  vi: viMessages,
} as const satisfies Record<SupportedLocale, Record<MessageKey, string>>

export type { MessageKey }
