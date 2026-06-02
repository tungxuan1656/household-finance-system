import '@/lib/telegram/telegram-webapp.d.ts'

import { isTMA } from '@tma.js/sdk'

type Capability =
  | 'secureStorage'
  | 'deviceStorage'
  | 'hapticFeedback'
  | 'themeParams'
  | 'backButton'
  | 'mainButton'

const detect = (capability: Capability): boolean => {
  if (!isTMA()) {
    return false
  }

  const tg = window.Telegram?.WebApp
  if (!tg) {
    return false
  }

  switch (capability) {
    case 'secureStorage':
    case 'deviceStorage':
      return Boolean(tg.initData.length > 0)
    case 'hapticFeedback':
      return Boolean(tg.HapticFeedback)
    case 'themeParams':
      return Boolean(tg.themeParams)
    case 'backButton':
      return Boolean(tg.BackButton)
    case 'mainButton':
      return Boolean(tg.MainButton)
  }
}

export const isSupported = (capability: Capability): boolean =>
  detect(capability)
