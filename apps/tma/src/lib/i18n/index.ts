import '@/lib/telegram/telegram-webapp.d.ts'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/lib/i18n/locales/en.json'
import vi from '@/lib/i18n/locales/vi.json'

const SUPPORTED_LOCALES = ['vi', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'vi'

const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  typeof value === 'string' &&
  (SUPPORTED_LOCALES as readonly string[]).includes(value)

export const detectTelegramLocale = (): SupportedLocale | null => {
  const raw = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code

  return isSupportedLocale(raw) ? raw : null
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  })
  .catch((error: unknown) => {
    console.error('i18n init failed', error)
  })

export { i18n }
