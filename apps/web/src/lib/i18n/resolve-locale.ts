import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/lib/constants/i18n'

const normalizeLocale = (input: string) =>
  input.trim().toLowerCase().replace('_', '-')

const isSupportedLocale = (value: string): value is SupportedLocale =>
  SUPPORTED_LOCALES.includes(value as SupportedLocale)

export const resolveLocale = (input?: string | null): SupportedLocale => {
  if (!input) {
    return DEFAULT_LOCALE
  }

  const primaryLocale = normalizeLocale(input).split(',')[0]?.split('-')[0]

  if (!primaryLocale) {
    return DEFAULT_LOCALE
  }

  return isSupportedLocale(primaryLocale) ? primaryLocale : DEFAULT_LOCALE
}
