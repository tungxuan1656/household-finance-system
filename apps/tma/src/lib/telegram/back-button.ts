import { backButton, miniApp } from '@tma.js/sdk'

type Cleanup = () => void

export const showBackButton = (onClick: () => void): Cleanup => {
  if (!backButton.isMounted()) {
    backButton.mount()
  }

  const offClick = backButton.onClick(onClick)
  backButton.show.ifAvailable()

  return () => {
    offClick()
    backButton.hide.ifAvailable()
  }
}

export const hideBackButton = (): void => {
  backButton.hide.ifAvailable()
}

export const closeMiniApp = (): void => {
  miniApp.close.ifAvailable()
}
