import { init, isTMA, mockTelegramEnv, viewport } from '@tma.js/sdk'

viewport.requestFullscreen()

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
    window.Telegram?.WebApp?.expand?.()
    window.Telegram?.WebApp?.requestFullscreen?.()
    window.Telegram?.WebApp?.disableVerticalSwipes?.()
  }

  return cleanup
}

export const teardownTelegram = (cleanup: () => void) => {
  cleanup()
  resetTheme()
}
