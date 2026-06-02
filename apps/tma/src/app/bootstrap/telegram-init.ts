import { init, isTMA, mockTelegramEnv } from '@tma.js/sdk'

import { bindTheme, resetTheme } from '@/lib/telegram/theme'

const isDev = import.meta.env.DEV

export const initTelegram = (): (() => void) => {
  if (isDev && !isTMA()) {
    mockTelegramEnv()
  }

  bindTheme()

  const cleanup = init({
    acceptCustomStyles: true,
  })

  if (isTMA()) {
    window.Telegram?.WebApp?.ready?.()
  }

  return cleanup
}

export const teardownTelegram = (cleanup: () => void) => {
  cleanup()
  resetTheme()
}
