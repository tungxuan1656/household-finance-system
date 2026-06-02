import '@/lib/telegram/telegram-webapp.d.ts'

import { isTMA } from '@tma.js/sdk'

export const readRawInitData = (): string | null => {
  if (!isTMA()) {
    return null
  }

  const raw = window.Telegram?.WebApp?.initData
  if (typeof raw === 'string' && raw.length > 0) {
    return raw
  }

  return null
}
