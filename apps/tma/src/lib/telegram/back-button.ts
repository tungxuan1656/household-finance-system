import { miniApp } from '@tma.js/sdk'

export const closeMiniApp = (): void => {
  miniApp.close.ifAvailable()
}
