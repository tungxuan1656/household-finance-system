import '@/lib/telegram/telegram-webapp.d.ts'

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

const ZERO: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 }

export const getSafeAreaInsets = (): SafeAreaInsets =>
  window.Telegram?.WebApp?.safeAreaInset ?? ZERO

export const getContentSafeAreaInsets = (): SafeAreaInsets =>
  window.Telegram?.WebApp?.contentSafeAreaInset ?? ZERO
