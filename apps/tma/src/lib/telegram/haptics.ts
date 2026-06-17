import { hapticFeedback } from '@tma.js/sdk'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'success' | 'warning' | 'error'

export const impact = (style: ImpactStyle = 'medium') => {
  hapticFeedback.impactOccurred.ifAvailable(style)
}

export const notification = (type: NotificationType) => {
  hapticFeedback.notificationOccurred.ifAvailable(type)
}

export const selection = () => {
  hapticFeedback.selectionChanged.ifAvailable()
}
