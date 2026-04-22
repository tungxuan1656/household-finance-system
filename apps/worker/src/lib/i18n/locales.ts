export type SupportedLocale = 'vi'

export const defaultLocale: SupportedLocale = 'vi'

export const supportedLocales = [defaultLocale] as const

export const isSupportedLocale = (value: string): value is SupportedLocale =>
  value === defaultLocale
