import {
  backButton,
  init,
  initData,
  miniApp,
  swipeBehavior,
  themeParams,
  viewport,
} from '@tma.js/sdk'

import {
  DEFAULT_TMA_BG,
  initializeFixedLightPlatform,
  resetTheme,
  syncViewportInsets,
} from '@/lib/telegram/theme'

export interface TelegramInitResult {
  cleanup: () => void
  error: Error | null
}

const NOOP_CLEANUP = () => undefined

const toError = (error: unknown): Error =>
  error instanceof Error
    ? error
    : new Error(
        typeof error === 'string' ? error : 'Unknown Telegram init error',
      )

export const initTelegram = (): (() => void) => {
  let disposed = false

  // 1. Initialize the SDK — must be called before using any component
  const cleanup = init({
    acceptCustomStyles: true,
  })

  // 2. Mount themeParams first — required by miniApp
  themeParams.mount()

  // 3. Mount miniApp (requires themeParams to be mounted first)
  miniApp.mount()

  // 3b. Mount backButton up-front so components only toggle visibility.
  if (backButton.isSupported()) {
    backButton.mount()
  }

  // 4. Initialize the fixed-light app base and viewport safe-area CSS vars.
  initializeFixedLightPlatform(DEFAULT_TMA_BG)

  // 4b. Set the native background so route transitions never flash black.
  // Must run after miniApp.mount() so Telegram chrome uses the same light base.
  miniApp.setBgColor.ifAvailable(DEFAULT_TMA_BG)
  miniApp.setHeaderColor.ifAvailable(DEFAULT_TMA_BG)
  miniApp.setBottomBarColor.ifAvailable(DEFAULT_TMA_BG)

  // 5. Signal ready immediately so Telegram hides its placeholder and the
  // app shows content ASAP. Do not wait for viewport mount/fullscreen.
  if (!disposed) {
    miniApp.ready.ifAvailable()
  }

  // 6. Mount viewport, expand, try fullscreen. Errors are swallowed since
  // the app is already interactive.
  void viewport
    .mount()
    .then(async () => {
      if (disposed) {
        return
      }

      syncViewportInsets()

      // `expand()` only asks the host viewport to expand; it does not await a
      // bridge round-trip.  Keep it fire-and-forget so fullscreen can continue
      // in the background after Telegram has already hidden its placeholder.
      viewport.expand()

      if (!viewport.isFullscreen()) {
        await Promise.resolve(viewport.requestFullscreen.ifAvailable())
      }

      if (!disposed) {
        syncViewportInsets()
      }
    })
    .catch(() => undefined)

  // 7. Disable vertical swipes to prevent accidental close while scrolling
  swipeBehavior.mount()
  swipeBehavior.disableVertical.ifAvailable()

  // 8. Restore initData from launch parameters
  initData.restore()

  return () => {
    disposed = true

    cleanup()
  }
}

export const initTelegramSafely = (): TelegramInitResult => {
  try {
    return {
      cleanup: initTelegram(),
      error: null,
    }
  } catch (error) {
    return {
      cleanup: NOOP_CLEANUP,
      error: toError(error),
    }
  }
}

export const teardownTelegram = (cleanup: () => void) => {
  cleanup()
  resetTheme()
}
