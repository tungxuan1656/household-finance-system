import { APP_LANGUAGE_STORAGE_KEY } from '@/lib/constants/i18n'
import { writeLocalStorageItem } from '@/lib/storages/browser-storage'

import i18n from './i18n-init'
import { resolveLocale } from './resolve-locale'

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
