import { miniApp, themeParams, viewport } from '@tma.js/sdk'

const ROOT = document.documentElement
export const DEFAULT_TMA_BG = '#f5f7fb'

const THEME_VARS = ['--tma-base-bg']
const TG_THEME_PREFIX = '--tg-theme-'
const SAFE_AREA_PREFIXES = ['--tma-safe', '--tma-content-safe'] as const

let unsubscribeMiniApp: (() => void) | null = null
let unsubscribeTheme: (() => void) | null = null
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

const clearThemeVars = () => {
  for (const name of THEME_VARS) {
    ROOT.style.removeProperty(name)
  }

  for (const prefix of SAFE_AREA_PREFIXES) {
    ROOT.style.removeProperty(`${prefix}-top`)
    ROOT.style.removeProperty(`${prefix}-right`)
    ROOT.style.removeProperty(`${prefix}-bottom`)
    ROOT.style.removeProperty(`${prefix}-left`)
  }

  const known = [
    'bg-color',
    'text-color',
    'hint-color',
    'link-color',
    'button-color',
    'button-text-color',
    'secondary-bg-color',
    'header-bg-color',
  ]
  for (const name of known) {
    ROOT.style.removeProperty(`${TG_THEME_PREFIX}${name}`)
  }
}

const applyBaseBackground = (backgroundColor: string): void => {
  ROOT.style.setProperty('--tma-base-bg', backgroundColor)
}

export const bindTheme = (fallbackBg: string = DEFAULT_TMA_BG): void => {
  // themeParams and miniApp should already be mounted by initTelegram
  if (!unsubscribeMiniApp && miniApp.bindCssVars.isAvailable()) {
    unsubscribeMiniApp = miniApp.bindCssVars()
  }

  if (!unsubscribeTheme && themeParams.isMounted()) {
    unsubscribeTheme = themeParams.bindCssVars()
  }

  // Use Telegram theme bg color if available, otherwise fallback
  const themeBg = themeParams.isMounted() ? themeParams.bgColor() : undefined
  applyBaseBackground(themeBg ?? fallbackBg)
  syncViewportInsets()
}

export const resetTheme = (): void => {
  unsubscribeMiniApp?.()
  unsubscribeMiniApp = null
  unsubscribeTheme?.()
  unsubscribeTheme = null
  unsubscribeViewport?.()
  unsubscribeViewport = null
  clearThemeVars()
}
