import { mainButton, themeParams } from '@tma.js/sdk'

export interface BottomButtonOptions {
  text: string
  enabled: boolean
  showProgress: boolean
  onClick: () => void
}

type Cleanup = () => void

export const setBottomButton = (options: BottomButtonOptions): Cleanup => {
  // themeParams and mainButton may already be mounted by initTelegram
  if (!themeParams.isMounted()) {
    themeParams.mount()
  }
  if (!mainButton.isMounted()) {
    mainButton.mount()
  }

  mainButton.setParams({
    text: options.text,
    isEnabled: options.enabled,
    isLoaderVisible: options.showProgress,
    isVisible: true,
  })

  const offClick = mainButton.onClick(options.onClick)

  return () => {
    offClick()
    mainButton.setParams({ isVisible: false })
  }
}

export const hideBottomButton = (): void => {
  if (mainButton.isMounted()) {
    mainButton.setParams({ isVisible: false })
  }
}
