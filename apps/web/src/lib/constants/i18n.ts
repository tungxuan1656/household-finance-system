export const APP_LANGUAGE_STORAGE_KEY = 'appLanguage'
export const DEFAULT_LOCALE = 'vi' as const

export const SUPPORTED_LOCALES = [DEFAULT_LOCALE] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
