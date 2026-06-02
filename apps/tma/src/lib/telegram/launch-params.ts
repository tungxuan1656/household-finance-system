import '@/lib/telegram/telegram-webapp.d.ts'

import { isTMA, retrieveRawInitData } from '@tma.js/sdk'

export const readRawInitData = (): string | null => {
  if (typeof window === 'undefined' || !isTMA()) {
    return null
  }

  try {
    const raw = retrieveRawInitData()

    if (typeof raw === 'string' && raw.length > 0) {
      return raw
    }
  } catch {
    // fall through to window fallback below
  }

  const fallback = window.Telegram?.WebApp?.initData

  return typeof fallback === 'string' && fallback.length > 0 ? fallback : null
}
