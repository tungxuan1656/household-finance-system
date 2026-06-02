import '@/lib/telegram/telegram-webapp.d.ts'

type Cleanup = () => void

const getBackButton = () => window.Telegram?.WebApp?.BackButton

export const showBackButton = (onClick: () => void): Cleanup => {
  const btn = getBackButton()
  if (!btn) {
    return () => undefined
  }

  const handler = () => {
    onClick()
  }

  btn.onClick(handler)
  btn.show()

  return () => {
    btn.offClick(handler)
  }
}

export const hideBackButton = (): void => {
  getBackButton()?.hide()
}
