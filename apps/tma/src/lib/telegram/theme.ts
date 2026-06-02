import '@/lib/telegram/telegram-webapp.d.ts'

const ROOT = document.documentElement

export const getBaseBackgroundColor = (): string => {
  const bg = window.Telegram?.WebApp?.backgroundColor

  return bg && bg.length > 0 ? bg : '#ffffff'
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

  const bg = getBaseBackgroundColor()
  ROOT.style.setProperty('--tma-base-bg', bg)
  document.body.style.backgroundColor = bg
}

export const bindTheme = (): void => {
  applyThemeParams()
}

export const resetTheme = (): void => {
  document.body.style.backgroundColor = ''
}
