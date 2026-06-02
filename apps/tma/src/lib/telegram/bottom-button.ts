import '@/lib/telegram/telegram-webapp.d.ts'

export interface BottomButtonOptions {
  text: string
  enabled: boolean
  showProgress: boolean
  onClick: () => void
}

type Cleanup = () => void

const getMainButton = () => window.Telegram?.WebApp?.MainButton

export const setBottomButton = (options: BottomButtonOptions): Cleanup => {
  const btn = getMainButton()
  if (!btn) {
    return () => undefined
  }

  const handler = () => {
    options.onClick()
  }

  btn.setText(options.text)
  if (options.enabled) {
    btn.enable()
  } else {
    btn.disable()
  }
  if (options.showProgress) {
    btn.showProgress(true)
  } else {
    btn.hideProgress()
  }
  btn.onClick(handler)
  btn.show()

  return () => {
    btn.offClick(handler)
    btn.hide()
  }
}

export const hideBottomButton = (): void => {
  getMainButton()?.hide()
}
