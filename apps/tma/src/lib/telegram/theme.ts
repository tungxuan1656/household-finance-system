import { viewport } from '@tma.js/sdk'

const ROOT = document.documentElement
export const DEFAULT_TMA_BG = '#f5f7fb'

const SAFE_AREA_PREFIXES = ['--tma-safe', '--tma-content-safe'] as const

let unsubscribeViewport: (() => void) | null = null

const getViewportCssVarName = (key: string): string | null => {
  switch (key) {
    case 'safeAreaInsetTop':
      return '--tma-safe-top'
    case 'safeAreaInsetRight':
      return '--tma-safe-right'
    case 'safeAreaInsetBottom':
      return '--tma-safe-bottom'
    case 'safeAreaInsetLeft':
      return '--tma-safe-left'
    case 'contentSafeAreaInsetTop':
      return '--tma-content-safe-top'
    case 'contentSafeAreaInsetRight':
      return '--tma-content-safe-right'
    case 'contentSafeAreaInsetBottom':
      return '--tma-content-safe-bottom'
    case 'contentSafeAreaInsetLeft':
      return '--tma-content-safe-left'
    default:
      return null
  }
}

export const syncViewportInsets = (): void => {
  if (!viewport.isMounted() || unsubscribeViewport) {
    return
  }

  unsubscribeViewport = viewport.bindCssVars(getViewportCssVarName)
}

const clearViewportVars = () => {
  for (const prefix of SAFE_AREA_PREFIXES) {
    ROOT.style.removeProperty(`${prefix}-top`)
    ROOT.style.removeProperty(`${prefix}-right`)
    ROOT.style.removeProperty(`${prefix}-bottom`)
    ROOT.style.removeProperty(`${prefix}-left`)
  }
}

const applyBaseBackground = (backgroundColor: string): void => {
  ROOT.style.setProperty('--background', backgroundColor)
}

export const initializeFixedLightPlatform = (
  backgroundColor: string = DEFAULT_TMA_BG,
): void => {
  // Set the fixed light app base and initialize viewport safe-area variables.
  applyBaseBackground(backgroundColor)
  syncViewportInsets()
}

export const resetTheme = (): void => {
  unsubscribeViewport?.()
  unsubscribeViewport = null
  clearViewportVars()
}
