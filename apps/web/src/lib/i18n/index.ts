import type { ParseKeys } from 'i18next'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import {
  APP_LANGUAGE_STORAGE_KEY,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '@/lib/constants/i18n'
import {
  readLocalStorageItem,
  writeLocalStorageItem,
} from '@/lib/storages/browser-storage'

import translationVI from './locales/vi.json'
import { resolveLocale } from './resolve-locale'

const localesResource = {
  vi: { translation: translationVI },
} as const

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: typeof localesResource.vi
    returnNull: false
  }
}

const readStoredLanguage = () => {
  return readLocalStorageItem(APP_LANGUAGE_STORAGE_KEY)
}

const readBrowserLanguage = () => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language
  }

  if (typeof document !== 'undefined') {
    return document.documentElement.lang
  }

  return null
}

const appLanguage = resolveLocale(readStoredLanguage() ?? readBrowserLanguage())

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: localesResource,
    lng: appLanguage,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: [],
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: APP_LANGUAGE_STORAGE_KEY,
    },
    supportedLngs: [...SUPPORTED_LOCALES],
    cleanCode: true,
    load: 'languageOnly',
    nonExplicitSupportedLngs: false,
  })

export default i18n

export const t = (
  key: ParseKeys<'translation'>,
  options?: Record<string, unknown>,
) => i18n.t(key, options as never) as unknown as string

export const changeLanguage = (lang: string) => {
  const nextLanguage = resolveLocale(lang)

  if (typeof window !== 'undefined') {
    try {
      writeLocalStorageItem(APP_LANGUAGE_STORAGE_KEY, nextLanguage)
    } catch {
      // Persisting language is best-effort in restricted storage contexts.
    }
  }

  void i18n.changeLanguage(nextLanguage)

  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
