import {
  init,
  initData,
  miniApp,
  swipeBehavior,
  themeParams,
  viewport,
} from '@tma.js/sdk'

import { bindTheme, resetTheme, syncViewportInsets } from '@/lib/telegram/theme'

// Matches --tma-base-bg in index.css. Set on the Telegram WebView so
// transitions between pages do not flash a default background color.
const APP_BG = '#f5f7fb'

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
  let fullscreenRafId: number | null = null
  const timeoutIds = new Set<number>()

  const scheduleTimeout = (callback: () => void, delayMs: number): number => {
    const timeoutId = window.setTimeout(() => {
      timeoutIds.delete(timeoutId)

      if (!disposed) {
        callback()
      }
    }, delayMs)

    timeoutIds.add(timeoutId)

    return timeoutId
  }

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

  // 4b. Set the native background so route transitions never flash black.
  // Must run after miniApp.mount() and after themeParams are bound.
  miniApp.setBgColor.ifAvailable(APP_BG)
  miniApp.setHeaderColor.ifAvailable(APP_BG)
  miniApp.setBottomBarColor.ifAvailable(APP_BG)

  // 5. Signal to Telegram that the app is ready (hides loading screen)
  miniApp.ready.ifAvailable()

  // 6. Mount and expand viewport
  void viewport
    .mount()
    .then(() => {
      if (disposed) {
        return
      }

      syncViewportInsets()
      viewport.expand()
      syncViewportInsets()

      // Request fullscreen on the next frame so the first paint can land
      // with the correct background instead of flashing during the transition.
      if (!viewport.isFullscreen()) {
        fullscreenRafId = window.requestAnimationFrame(() => {
          fullscreenRafId = null

          if (disposed) {
            return
          }

          syncViewportInsets()

          scheduleTimeout(() => {
            viewport.requestFullscreen.ifAvailable()
            syncViewportInsets()

            scheduleTimeout(() => {
              syncViewportInsets()
            }, 120)
          }, 32)
        })
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

    if (fullscreenRafId !== null) {
      window.cancelAnimationFrame(fullscreenRafId)
      fullscreenRafId = null
    }

    for (const timeoutId of timeoutIds) {
      window.clearTimeout(timeoutId)
    }
    timeoutIds.clear()

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
