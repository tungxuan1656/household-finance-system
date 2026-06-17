import { mainButton, themeParams } from '@tma.js/sdk'

export interface BottomButtonOptions {
  text: string
  enabled: boolean
  showProgress: boolean
  onClick: () => void
}

export type BottomButtonVisualOptions = Omit<BottomButtonOptions, 'onClick'>

type Cleanup = () => void

const ensureBottomButtonMounted = (): void => {
  if (!themeParams.isMounted()) {
    themeParams.mount()
  }
  if (!mainButton.isMounted()) {
    mainButton.mount()
  }
}

export const setBottomButton = (options: BottomButtonOptions): Cleanup => {
  ensureBottomButtonMounted()
  updateBottomButton(options)

  const offClick = mainButton.onClick(options.onClick)

  return () => {
    offClick()
    mainButton.setParams({ isVisible: false })
  }
}

export const updateBottomButton = (
  options: BottomButtonVisualOptions,
): void => {
  ensureBottomButtonMounted()

  mainButton.setParams({
    text: options.text,
    isEnabled: options.enabled,
    isLoaderVisible: options.showProgress,
    isVisible: true,
  })
}

export const hideBottomButton = (): void => {
  if (mainButton.isMounted()) {
    mainButton.setParams({ isVisible: false })
  }
}
