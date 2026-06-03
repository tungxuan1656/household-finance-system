import {
  init,
  initData,
  miniApp,
  swipeBehavior,
  themeParams,
  viewport,
} from '@tma.js/sdk'

import { bindTheme, resetTheme } from '@/lib/telegram/theme'

export const initTelegram = (): (() => void) => {
  // 1. Initialize the SDK — must be called before using any component
  const cleanup = init({
    acceptCustomStyles: true,
  })

  // 2. Mount themeParams first — required by miniApp and mainButton
  themeParams.mount()

  // 3. Mount miniApp (requires themeParams to be mounted first)
  miniApp.mount()

  // 4. Bind Telegram theme to CSS variables (must come AFTER mount)
  bindTheme()

  // 5. Signal to Telegram that the app is ready (hides loading screen)
  miniApp.ready.ifAvailable()

  // 6. Mount and expand viewport
  viewport.mount().then(() => {
    viewport.expand()
    // Request fullscreen (Bot API 8.0+)
    viewport.requestFullscreen.ifAvailable()
  })

  // 7. Disable vertical swipes to prevent accidental close while scrolling
  swipeBehavior.mount()
  swipeBehavior.disableVertical.ifAvailable()

  // 8. Restore initData from launch parameters
  initData.restore()

  return cleanup
}

export const teardownTelegram = (cleanup: () => void) => {
  cleanup()
  resetTheme()
}
