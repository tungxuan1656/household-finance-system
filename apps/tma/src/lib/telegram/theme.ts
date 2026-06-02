import '@/lib/telegram/telegram-webapp.d.ts'

import type { SafeAreaInsets } from '@/lib/telegram/safe-area'
import {
  getContentSafeAreaInsets,
  getSafeAreaInsets,
} from '@/lib/telegram/safe-area'

const ROOT = document.documentElement

const setSafeAreaVar = (name: string, value: number) => {
  ROOT.style.setProperty(name, `${value}px`)
}

const applySafeAreaInsets = () => {
  const safe = getSafeAreaInsets()
  const content = getContentSafeAreaInsets()
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

const applyThemeParams = () => {
  const params = window.Telegram?.WebApp?.themeParams
  if (!params) {
    return
  }

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.length > 0) {
      ROOT.style.setProperty(`--tg-theme-${key.replace(/_/g, '-')}`, value)
    }
  }

  const bg = window.Telegram?.WebApp?.backgroundColor
  if (typeof bg === 'string' && bg.length > 0) {
    ROOT.style.setProperty('--tma-base-bg', bg)
  }

  applySafeAreaInsets()
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

const handleThemeEvent = () => {
  applyThemeParams()
}

let unsubscribeTheme: (() => void) | null = null

export const bindTheme = (): void => {
  applyThemeParams()

  const tg = window.Telegram?.WebApp
  if (!tg?.onEvent) {
    return
  }

  tg.onEvent('themeChanged', handleThemeEvent)
  tg.onEvent('safeAreaChanged', applySafeAreaInsets)
  tg.onEvent('contentSafeAreaChanged', applySafeAreaInsets)

  unsubscribeTheme = () => {
    tg.offEvent?.('themeChanged', handleThemeEvent)
    tg.offEvent?.('safeAreaChanged', applySafeAreaInsets)
    tg.offEvent?.('contentSafeAreaChanged', applySafeAreaInsets)
  }
}

export const resetTheme = (): void => {
  unsubscribeTheme?.()
  unsubscribeTheme = null
  clearThemeVars()
}
