import { miniApp, themeParams, viewport } from '@tma.js/sdk'

import type { SafeAreaInsets } from '@/lib/telegram/safe-area'

const ROOT = document.documentElement

const setSafeAreaVar = (name: string, value: number) => {
  ROOT.style.setProperty(name, `${value}px`)
}

const applySafeAreaInsets = () => {
  if (!viewport.isMounted()) return

  const safe = viewport.safeAreaInsets() ?? {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
  const content = viewport.contentSafeAreaInsets() ?? {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
  const insets: Record<string, SafeAreaInsets> = {
    '--tma-safe': safe,
    '--tma-content-safe': content,
  }

  for (const [prefix, inset] of Object.entries(insets)) {
    setSafeAreaVar(`${prefix}-top`, inset.top)
    setSafeAreaVar(`${prefix}-right`, inset.right)
    setSafeAreaVar(`${prefix}-bottom`, inset.bottom)
    setSafeAreaVar(`${prefix}-left`, inset.left)
  }
}

const THEME_VARS = ['--tma-base-bg']
const TG_THEME_PREFIX = '--tg-theme-'

const clearThemeVars = () => {
  for (const name of THEME_VARS) {
    ROOT.style.removeProperty(name)
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

// Apply themeParams CSS variables via SDK
const applyThemeParams = () => {
  if (!themeParams.isMounted()) return

  // The SDK handles --tg-theme-* variables via bindCssVars()
  themeParams.bindCssVars()

  // Apply background color as --tma-base-bg
  const bg = themeParams.bgColor()
  if (typeof bg === 'string' && bg.length > 0) {
    ROOT.style.setProperty('--tma-base-bg', bg)
  }

  applySafeAreaInsets()
}

// Use SDK miniApp.bindCssVars() for --tg-bg-color / --tg-header-color
let unsubscribeTheme: (() => void) | null = null

export const bindTheme = (): void => {
  // themeParams and miniApp should already be mounted by initTelegram
  miniApp.bindCssVars.ifAvailable()
  applyThemeParams()
  applySafeAreaInsets()
}

export const resetTheme = (): void => {
  unsubscribeTheme?.()
  unsubscribeTheme = null
  clearThemeVars()
}
