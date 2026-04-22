import {
  defaultLocale,
  isSupportedLocale,
  type SupportedLocale,
} from './locales'

const normalizeLocaleToken = (token: string): string =>
  token.trim().toLowerCase().split(';')[0] ?? ''

const toCanonicalLocale = (token: string): SupportedLocale | null => {
  const normalized = normalizeLocaleToken(token)

  if (
    normalized === defaultLocale ||
    normalized.startsWith(`${defaultLocale}-`)
  ) {
    return defaultLocale
  }

  if (isSupportedLocale(normalized)) {
    return normalized
  }

  return null
}

export const resolveLocale = (
  value: string | null | undefined,
): SupportedLocale => {
  if (!value) {
    return defaultLocale
  }

  for (const candidate of value.split(',')) {
    const locale = toCanonicalLocale(candidate)

    if (locale) {
      return locale
    }
  }

  return defaultLocale
}
