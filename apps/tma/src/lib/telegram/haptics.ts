import '@/lib/telegram/telegram-webapp.d.ts'

import { isTMA } from '@tma.js/sdk'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'success' | 'warning' | 'error'

const getHaptic = () => window.Telegram?.WebApp?.HapticFeedback

export const impact = (style: ImpactStyle = 'medium') => {
  if (!isTMA()) {
    return
  }
  getHaptic()?.impactOccurred(style)
}

export const notification = (type: NotificationType) => {
  if (!isTMA()) {
    return
  }
  getHaptic()?.notificationOccurred(type)
}

export const selection = () => {
  if (!isTMA()) {
    return
  }
  getHaptic()?.selectionChanged()
}
