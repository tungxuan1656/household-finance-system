import { messageCatalog, type MessageKey } from './catalog'
import { defaultLocale, type SupportedLocale } from './locales'
import { resolveLocale } from './resolve-locale'

export type TranslateParams = Record<string, string | number>

export type Translator = (key: MessageKey, params?: TranslateParams) => string

const interpolate = (template: string, params?: TranslateParams): string => {
  if (!params) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]

    return value === undefined || value === null ? `{${key}}` : String(value)
  })
}

export const createTranslator = (
  locale: string | SupportedLocale = defaultLocale,
): Translator => {
  const resolvedLocale = resolveLocale(locale)

  return (key, params) =>
    interpolate(messageCatalog[resolvedLocale][key], params)
}

export const translate = (
  locale: string | SupportedLocale,
  key: MessageKey,
  params?: TranslateParams,
): string => createTranslator(locale)(key, params)
