import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import vi from '@/lib/i18n/locales/vi.json'

export const DEFAULT_LOCALE = 'vi' as const
export type SupportedLocale = typeof DEFAULT_LOCALE

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
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
